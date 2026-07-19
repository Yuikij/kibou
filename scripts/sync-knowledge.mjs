#!/usr/bin/env node
/**
 * 知识库同步脚本:把 docs/ 和 blog/ 下的 markdown 增量同步到
 * Cloudflare AI Search(实例 kibou-rag,内置存储),供 RAG 检索。
 *
 * 通过已部署 Worker 的管理接口(/api/rag/*,Bearer SYNC_SECRET 鉴权)操作,
 * 上传后立即索引,无需等待定时任务。
 *
 * 用法: node scripts/sync-knowledge.mjs [--dry-run] [--full]
 *   --dry-run  只打印将要执行的操作
 *   --full     忽略本地 manifest,强制重新上传全部文件
 *
 * 配置(环境变量或 .dev.vars 文件):
 *   SYNC_SECRET     管理接口密钥(必需,与 wrangler secret 一致)
 *   KIBOU_SYNC_URL  Worker 地址,默认 https://yuisama.top
 *
 * 增量机制:本地 manifest(.rag-sync-manifest.json,已 gitignore)记录每个
 * 文件的 md5,只上传新增/变更文件;远端多出的文档会被删除。
 */
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE_DIRS = ['docs', 'blog'];
const EXTENSIONS = new Set(['.md', '.mdx']);
const MANIFEST_PATH = path.join(ROOT, '.rag-sync-manifest.json');
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

async function api(method, apiPath, body, contentType = 'application/json') {
  const response = await fetch(`${BASE_URL}${apiPath}`, {
    method,
    headers: {
      authorization: `Bearer ${SECRET}`,
      ...(body ? { 'content-type': contentType } : {}),
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

function collectLocalFiles() {
  const files = new Map(); // key(POSIX 风格相对路径) -> { absPath, hash }
  let skippedEmpty = 0;
  for (const dir of SOURCE_DIRS) {
    const abs = path.join(ROOT, dir);
    if (!existsSync(abs)) continue;
    for (const file of walk(abs)) {
      const content = readFileSync(file);
      if (content.toString('utf8').trim().length === 0) {
        skippedEmpty += 1;
        continue;
      }
      const key = path.relative(ROOT, file).split(path.sep).join('/');
      const hash = createHash('md5').update(content).digest('hex');
      files.set(key, { absPath: file, hash });
    }
  }
  if (skippedEmpty > 0) console.log(`跳过 ${skippedEmpty} 个空文件`);
  return files;
}

function loadManifest() {
  if (fullSync || !existsSync(MANIFEST_PATH)) return {};
  try {
    return JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'));
  } catch {
    return {};
  }
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
    console.error('缺少 SYNC_SECRET(设置环境变量,或写入 .dev.vars)');
    process.exit(1);
  }

  console.log(`目标: ${BASE_URL}`);
  console.log('确保 AI Search 实例存在...');
  if (!dryRun) {
    const setup = await api('POST', '/api/rag/setup');
    console.log(`  实例: ${setup.created ?? setup.updated}`);
  }

  const local = collectLocalFiles();
  const manifest = loadManifest();

  console.log('拉取远端文档列表...');
  const { items: remoteItems } = await api('GET', '/api/rag/items');
  const remoteByKey = new Map(remoteItems.map((item) => [item.key, item]));

  const toUpload = [];
  for (const [key, { absPath, hash }] of local) {
    if (!remoteByKey.has(key) || manifest[key] !== hash) {
      toUpload.push({ key, absPath, hash });
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

  const newManifest = { ...manifest };
  const uploadTasks = toUpload.map(({ key, absPath, hash }) => ({
    label: `PUT ${key}`,
    run: async () => {
      const content = readFileSync(absPath);
      await api('PUT', `/api/rag/items/${encodeURIComponent(key)}`, content, 'text/markdown');
      newManifest[key] = hash;
    },
  }));
  const deleteTasks = toDelete.map((item) => ({
    label: `DELETE ${item.key}`,
    run: async () => {
      await api('DELETE', `/api/rag/items/${encodeURIComponent(item.id)}`);
      delete newManifest[item.key];
    },
  }));

  console.log('开始同步...');
  const failures = await runPool([...uploadTasks, ...deleteTasks], CONCURRENCY);

  for (const key of Object.keys(newManifest)) {
    if (!local.has(key)) delete newManifest[key];
  }
  const sorted = Object.fromEntries(Object.entries(newManifest).sort(([a], [b]) => a.localeCompare(b)));
  writeFileSync(MANIFEST_PATH, JSON.stringify(sorted, null, 2) + '\n');

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
