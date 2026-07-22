#!/usr/bin/env node
/**
 * 知识库同步脚本:把 docs/ 和 blog/ 下的 markdown 增量同步到
 * Cloudflare AI Search(实例 kibou-rag,内置存储),供 RAG 检索。
 *
 * 通过已部署 Worker 的管理接口(/api/rag/*,Bearer SYNC_SECRET 鉴权)操作,
 * 上传后立即索引,无需等待定时任务。
 *
 * 增量机制(无状态,本地和 CI 都可跑):上传时把内容 md5 存进
 * item metadata,每次同步拉取远端列表比对 md5,只上传新增/变更文件,
 * 删除仓库里已不存在的远端文档。
 *
 * 上传的正文会注入一行元数据头(标题/日期/位置):标题和日期往往只存在
 * 于文件名或 frontmatter,不注入的话检索不到("哪天去了1912"这类问题)。
 * 元数据全部从文件自身推导(不依赖构建产物和 mtime),md5 对注入后的
 * 内容计算,因此头部格式变更也会自动触发重传。
 *
 * 用法: node scripts/sync-knowledge.mjs [--dry-run] [--full]
 *   --dry-run  只打印将要执行的操作
 *   --full     忽略 md5 比对,强制重新上传全部文件
 *
 * 配置(环境变量,本地可写在 .dev.vars;CI 在 Workers Builds 的
 * 构建环境变量里配置 SYNC_SECRET):
 *   SYNC_SECRET     管理接口密钥(必需,与 Worker secret 一致)
 *   KIBOU_SYNC_URL  Worker 地址,默认 https://yuisama.top
 */
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE_DIRS = ['docs', 'blog'];
const EXTENSIONS = new Set(['.md', '.mdx']);
const CONCURRENCY = 6;

const dryRun = process.argv.includes('--dry-run');
const fullSync = process.argv.includes('--full');

const BASE_URL = (process.env.KIBOU_SYNC_URL || 'https://yuisama.top').replace(/\/$/, '');
const SECRET = process.env.SYNC_SECRET || readSecretFromDevVars();

function readSecretFromDevVars() {
  const devVars = path.join(ROOT, '.dev.vars');
  if (!existsSync(devVars)) return '';
  const match = readFileSync(devVars, 'utf8').match(/^SYNC_SECRET\s*=\s*"?([^"\n]+)"?\s*$/m);
  return match ? match[1] : '';
}

async function api(method, apiPath, { body, headers } = {}) {
  const response = await fetch(`${BASE_URL}${apiPath}`, {
    method,
    headers: {
      authorization: `Bearer ${SECRET}`,
      ...(headers ?? {}),
    },
    body: body ?? undefined,
  });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`${method} ${apiPath} -> ${response.status}: ${text.slice(0, 200)}`);
  }
  return text ? JSON.parse(text) : null;
}

function walk(dir) {
  const results = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walk(fullPath));
    } else if (EXTENSIONS.has(path.extname(entry.name))) {
      results.push(fullPath);
    }
  }
  return results;
}

/** 提取 frontmatter 里的某个字段(简单单行值) */
function frontmatterField(content, field) {
  const fm = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!fm) return null;
  const line = fm[1].match(new RegExp(`^${field}\\s*:\\s*(.+)$`, 'm'));
  if (!line) return null;
  return line[1].trim().replace(/^["']|["']$/g, '') || null;
}

function extractTitle(key, content) {
  const fmTitle = frontmatterField(content, 'title');
  if (fmTitle) return fmTitle;
  const heading = content.match(/^#\s+(.+)$/m);
  if (heading) return heading[1].trim();
  const base = key.split('/').pop().replace(/\.(mdx?|md)$/, '');
  return base.replace(/^\d{4}-\d{2}-\d{2}-/, '');
}

function extractDate(key, content) {
  const base = key.split('/').pop();
  const fromName = base.match(/^(\d{4}-\d{2}-\d{2})-/);
  if (fromName) return fromName[1];
  const fmDate = frontmatterField(content, 'date');
  if (fmDate) return fmDate.slice(0, 10);
  return null;
}

/** 注入到正文前的元数据头:让标题/日期/所属栏目参与检索与问答 */
function buildHeader(key, content) {
  const parts = [`标题: ${extractTitle(key, content)}`];
  const date = extractDate(key, content);
  if (date) parts.push(`日期: ${date}`);
  parts.push(`位置: ${key.split('/').slice(0, -1).join('/')}`);
  return `[文档信息] ${parts.join(' | ')}\n\n`;
}

function collectLocalFiles() {
  const files = new Map(); // key(POSIX 风格相对路径) -> { body, hash }
  let skippedEmpty = 0;
  for (const dir of SOURCE_DIRS) {
    const abs = path.join(ROOT, dir);
    if (!existsSync(abs)) continue;
    for (const file of walk(abs)) {
      const content = readFileSync(file, 'utf8');
      if (content.trim().length === 0) {
        skippedEmpty += 1;
        continue;
      }
      const key = path.relative(ROOT, file).split(path.sep).join('/');
      const body = buildHeader(key, content) + content;
      const hash = createHash('md5').update(body).digest('hex');
      files.set(key, { body, hash });
    }
  }
  if (skippedEmpty > 0) console.log(`跳过 ${skippedEmpty} 个空文件`);
  return files;
}

/**
 * 从 .docusaurus 构建产物里读取「源文件 → 站点真实 permalink」映射。
 * Docusaurus 会剥离目录/文件名的数字前缀、应用 frontmatter slug 等规则,
 * 自己拼 URL 会 404,以构建元数据为准。
 */
function loadRouteMap() {
  const map = new Map();
  const docsDir = path.join(ROOT, '.docusaurus', 'docusaurus-plugin-content-docs', 'default');
  if (existsSync(docsDir)) {
    for (const name of readdirSync(docsDir)) {
      if (!name.startsWith('site-docs-') || !name.endsWith('.json')) continue;
      try {
        const meta = JSON.parse(readFileSync(path.join(docsDir, name), 'utf8'));
        if (meta.source?.startsWith('@site/') && meta.permalink) {
          map.set(meta.source.slice('@site/'.length), meta.permalink);
        }
      } catch {
        // 忽略解析失败的文件
      }
    }
  }
  const blogMeta = path.join(ROOT, '.docusaurus', 'docusaurus-plugin-content-blog', 'default', 'blog-posts-metadata.json');
  if (existsSync(blogMeta)) {
    try {
      for (const post of JSON.parse(readFileSync(blogMeta, 'utf8'))) {
        const meta = post.metadata ?? post;
        if (meta.source?.startsWith('@site/') && meta.permalink) {
          map.set(meta.source.slice('@site/'.length), meta.permalink);
        }
      }
    } catch {
      // 忽略
    }
  }
  return map;
}

async function runPool(tasks, concurrency) {
  const failures = [];
  let index = 0;
  let done = 0;
  async function worker() {
    while (index < tasks.length) {
      const current = tasks[index++];
      try {
        await current.run();
        done++;
        process.stdout.write(`\r  进度: ${done}/${tasks.length}`);
      } catch (err) {
        failures.push({ label: current.label, error: err });
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, tasks.length) }, worker));
  if (tasks.length > 0) process.stdout.write('\n');
  return failures;
}

async function main() {
  if (!SECRET) {
    console.error('缺少 SYNC_SECRET(本地写入 .dev.vars;CI 在 Workers Builds 构建环境变量里配置)');
    process.exit(1);
  }

  console.log(`目标: ${BASE_URL}`);
  console.log('确保 AI Search 实例存在...');
  if (!dryRun) {
    const setup = await api('POST', '/api/rag/setup');
    console.log(`  实例: ${setup.created ?? setup.updated}`);
  }

  const local = collectLocalFiles();
  const routeMap = loadRouteMap();
  if (routeMap.size === 0) {
    console.warn('警告: 没有找到 .docusaurus 构建元数据(先跑 yarn build),本次同步不更新来源链接。');
  } else {
    console.log(`已加载 ${routeMap.size} 条 permalink 映射`);
  }

  console.log('拉取远端文档列表...');
  const { items: remoteItems } = await api('GET', '/api/rag/items');
  const remoteByKey = new Map(remoteItems.map((item) => [item.key, item]));

  const toUpload = [];
  for (const [key, { body, hash }] of local) {
    const remote = remoteByKey.get(key);
    const url = routeMap.get(key) ?? null;
    const urlOutdated = url !== null && remote?.url !== url;
    if (fullSync || !remote || remote.md5 !== hash || urlOutdated) {
      toUpload.push({ key, body, hash, url });
    }
  }
  const toDelete = remoteItems.filter((item) => !local.has(item.key));

  console.log(`本地 ${local.size} 个文件,远端 ${remoteItems.length} 个;待上传 ${toUpload.length},待删除 ${toDelete.length}`);
  if (toUpload.length === 0 && toDelete.length === 0) {
    console.log('没有变更,跳过同步。');
    return;
  }
  if (dryRun) {
    toUpload.forEach(({ key }) => console.log(`  PUT    ${key}`));
    toDelete.forEach(({ key }) => console.log(`  DELETE ${key}`));
    return;
  }

  const uploadTasks = toUpload.map(({ key, body, hash, url }) => ({
    label: `PUT ${key}`,
    run: async () => {
      const query = url ? `?url=${encodeURIComponent(url)}` : '';
      await api('PUT', `/api/rag/items/${encodeURIComponent(key)}${query}`, {
        body,
        headers: { 'content-type': 'text/markdown', 'x-content-md5': hash },
      });
    },
  }));
  const deleteTasks = toDelete.map((item) => ({
    label: `DELETE ${item.key}`,
    run: async () => {
      await api('DELETE', `/api/rag/items/${encodeURIComponent(item.id)}`);
    },
  }));

  console.log('开始同步...');
  const failures = await runPool([...uploadTasks, ...deleteTasks], CONCURRENCY);

  if (failures.length > 0) {
    console.error(`\n${failures.length} 个操作失败:`);
    failures.slice(0, 10).forEach(({ label, error }) => {
      console.error(`  ${label}: ${error.message}`);
    });
    console.error('可重新运行脚本重试失败项。');
    process.exitCode = 1;
    return;
  }

  const stats = await api('GET', '/api/rag/stats');
  console.log(`索引状态: 完成 ${stats.completed ?? 0},排队 ${stats.queued ?? 0},处理中 ${stats.running ?? 0},失败 ${stats.error ?? 0}`);
  console.log('完成。上传的文档会在数秒到几分钟内完成索引。');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
