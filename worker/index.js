/**
 * kibou Worker:静态站点 + RAG 聊天 API + 知识库管理 API。
 *
 * 公开接口:
 *   POST /api/chat
 *     请求: { messages: [{ role: 'user'|'assistant', content: string }...], scope?: 'docs'|'blog' }
 *     响应: SSE 流,事件依次为:
 *       - event: sources
 *         data: { sources: [{ filePath, fileName, snippet, score }],
 *                 refMap: { "<材料编号>": <来源编号> } }
 *         (材料编号 = 喂给模型的检索分块顺序,对应回答里的 [n] 标注;
 *          来源编号 = 按文件去重后的展示顺序,从 1 开始)
 *       - data: { delta: "文本增量" } (若干条)
 *       - data: [DONE]
 *
 * 管理接口(需 Authorization: Bearer <SYNC_SECRET>,供 scripts/sync-knowledge.mjs 使用):
 *   POST   /api/rag/setup            创建/配置 AI Search 实例
 *   GET    /api/rag/items            列出已索引文档 [{ id, key }]
 *   PUT    /api/rag/items/<key>      上传/覆盖文档(body 为文件内容)
 *   DELETE /api/rag/items/<id>       删除文档
 *   GET    /api/rag/stats            索引进度统计
 *
 * 检索与生成托管在 Cloudflare AI Search(实例 kibou-rag,内置存储)。
 */

const INSTANCE_ID = 'kibou-rag';

const SYSTEM_PROMPT = `你是「喵帕斯」,Yuikij 博客(yuisama.top)的 AI 助手。博客内容涵盖编程语言、算法、数据库、分布式系统、AI/LLM、建站与 SEO、日语学习以及生活随笔。

回答规则:
- 优先依据检索到的博客内容回答,可以自然地概括与引用。
- 检索到的材料按提供顺序编号为 [1]、[2]、[3]……。当某句话依据了某段材料时,在句末标注对应编号,如 [1] 或 [1][3]。编号必须是实际提供的材料编号,严禁编造更大的编号;没有依据材料的句子不要标注。
- 材料开头的「[文档信息]」行给出了该文档的标题、日期和位置,它们和正文一样是可靠依据。日记/博客的日期就是事件发生的时间。例如:用户问"哪天去了1912",而某材料是「[文档信息] 标题: 两个人的话,去1912散步也是可以的 | 日期: 2025-03-17」,就应回答"2025-03-17(见这篇日记)",而不是说"正文没有提到日期"。
- 如果检索内容与问题无关或不足以回答,坦率说明,再谨慎补充通用知识。
- 默认使用中文,用户用其他语言提问时跟随用户的语言。
- 使用 Markdown,保持简洁、准确、有条理。`;

const MAX_MESSAGES = 16;
const MAX_CONTENT_LENGTH = 4000;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    try {
      if (url.pathname === '/api/chat') {
        if (request.method !== 'POST') return jsonError('Method not allowed', 405);
        return await handleChat(request, env);
      }
      if (url.pathname.startsWith('/api/rag/')) {
        try {
          return await handleAdmin(request, env, url);
        } catch (err) {
          // 管理接口有鉴权,返回详细错误便于排查
          console.error('admin error:', err);
          return jsonError(`admin error: ${err?.message ?? err}`, 502);
        }
      }
    } catch (err) {
      console.error('api error:', err?.message ?? err);
      return jsonError('服务暂时不可用,请稍后再试', 502);
    }

    return env.ASSETS.fetch(request);
  },
};

/* ---------------------------- 聊天 ---------------------------- */

async function handleChat(request, env) {
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonError('请求体必须是 JSON', 400);
  }

  const messages = sanitizeMessages(body?.messages);
  if (!messages) {
    return jsonError('messages 需为非空数组,元素形如 { role: "user"|"assistant", content: string },且最后一条是 user', 400);
  }

  // 注意:retrieval.context_expansion 在文档带自定义 metadata 后会触发
  // AI Search 后端 Internal Error(2026-07 实测),不要加回来。
  const aiSearchOptions = {
    retrieval: {
      max_num_results: 8,
    },
    query_rewrite: {
      // 改写的用途是补全多轮追问里的代词指代;首轮问题没有上下文可补,
      // 改写只会偏移原意、降低命中率,故仅在有历史时启用
      enabled: messages.length > 1,
      // 默认改写会把中文问题翻成英文,明显降低检索相关度,这里约束保持原语言
      rewrite_prompt:
        '你负责把多轮对话中用户的最新问题改写成一条独立、语义完整的检索查询,补全代词和上下文指代。必须保持与用户问题相同的语言(中文问题输出中文)。只输出改写后的查询,不要任何解释。',
    },
    cache: {
      enabled: false,
    },
  };
  const filter = scopeFilter(body?.scope);
  if (filter) {
    aiSearchOptions.retrieval.filters = filter;
  }

  const upstream = await instance(env).chatCompletions({
    messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
    stream: true,
    ai_search_options: aiSearchOptions,
  });

  const stream = extractSseBody(upstream).pipeThrough(translateStream());
  return new Response(stream, {
    headers: {
      'content-type': 'text/event-stream; charset=utf-8',
      'cache-control': 'no-cache',
      'x-accel-buffering': 'no',
    },
  });
}

function instance(env) {
  return env.AI_SEARCH.get(INSTANCE_ID);
}

// chatCompletions({stream:true}) 可能返回 ReadableStream 或 Response
function extractSseBody(upstream) {
  if (upstream instanceof Response) return upstream.body;
  return upstream;
}

function sanitizeMessages(raw) {
  if (!Array.isArray(raw) || raw.length === 0) return null;
  const cleaned = [];
  for (const item of raw) {
    if (!item || typeof item.content !== 'string' || !item.content.trim()) return null;
    if (item.role !== 'user' && item.role !== 'assistant') return null;
    cleaned.push({ role: item.role, content: item.content.slice(0, MAX_CONTENT_LENGTH) });
  }
  const recent = cleaned.slice(-MAX_MESSAGES);
  if (recent[recent.length - 1].role !== 'user') return null;
  return recent;
}

// folder 属性上的前缀过滤:'0' 是 '/' 的下一个字符,$gte/$lt 组合即前缀匹配。
function scopeFilter(scope) {
  if (scope !== 'docs' && scope !== 'blog') return null;
  return { folder: { $gte: `${scope}/`, $lt: `${scope}0` } };
}

/**
 * 把 AI Search 的 SSE(先 chunks 事件,后 OpenAI 风格增量)转成前端友好的精简 SSE。
 */
function translateStream() {
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = '';

  function translateEvent(rawEvent) {
    const lines = rawEvent.split('\n');
    let eventName = '';
    let data = '';
    for (const line of lines) {
      if (line.startsWith('event:')) eventName = line.slice(6).trim();
      else if (line.startsWith('data:')) data += line.slice(5).trim();
    }
    if (!data || data === '[DONE]') return null;

    if (eventName === 'chunks') {
      try {
        const citations = buildCitations(JSON.parse(data));
        return `event: sources\ndata: ${JSON.stringify(citations)}\n\n`;
      } catch {
        return null;
      }
    }

    try {
      const parsed = JSON.parse(data);
      const delta = parsed?.choices?.[0]?.delta?.content;
      if (typeof delta === 'string' && delta.length > 0) {
        return `data: ${JSON.stringify({ delta })}\n\n`;
      }
    } catch {
      // 忽略无法解析的事件
    }
    return null;
  }

  return new TransformStream({
    transform(chunk, controller) {
      buffer += decoder.decode(chunk, { stream: true });
      const events = buffer.split('\n\n');
      buffer = events.pop() ?? '';
      for (const rawEvent of events) {
        const out = translateEvent(rawEvent);
        if (out) controller.enqueue(encoder.encode(out));
      }
    },
    flush(controller) {
      if (buffer.trim()) {
        const out = translateEvent(buffer);
        if (out) controller.enqueue(encoder.encode(out));
      }
      controller.enqueue(encoder.encode('data: [DONE]\n\n'));
    },
  });
}

/**
 * 由检索分块构造引用信息:
 * - sources:按来源文件去重(保持首次出现顺序,与回答中的引用编号对应),
 *   每个文件保留得分最高的片段;
 * - refMap:材料编号(分块在上下文中的顺序,1 起)→ 来源编号(1 起),
 *   前端用它把回答里的 [n] 换算成对应来源。
 */
function buildCitations(chunks) {
  const sources = [];
  const refMap = {};
  if (!Array.isArray(chunks)) return { sources, refMap };
  const indexByFile = new Map();
  chunks.forEach((chunk, i) => {
    const key = chunk?.item?.key;
    if (!key) return;
    const snippet = (chunk.text ?? '').replace(/\s+/g, ' ').trim().slice(0, 160);
    const score = chunk.score ?? 0;
    let idx = indexByFile.get(key);
    if (!idx) {
      sources.push({
        filePath: key,
        fileName: key.split('/').pop(),
        url: chunk?.item?.metadata?.url ?? null,
        snippet,
        score,
      });
      idx = sources.length;
      indexByFile.set(key, idx);
    } else if (score > sources[idx - 1].score) {
      sources[idx - 1].score = score;
      sources[idx - 1].snippet = snippet;
    }
    refMap[i + 1] = idx;
  });
  return { sources, refMap };
}

/* ---------------------------- 知识库管理 ---------------------------- */

async function handleAdmin(request, env, url) {
  if (!env.SYNC_SECRET) {
    return jsonError('SYNC_SECRET 未配置', 500);
  }
  const auth = request.headers.get('authorization') ?? '';
  if (auth !== `Bearer ${env.SYNC_SECRET}`) {
    return jsonError('Unauthorized', 401);
  }

  const path = url.pathname;

  // 创建/配置实例(幂等:已存在则更新配置)
  if (path === '/api/rag/setup' && request.method === 'POST') {
    const config = {
      embedding_model: '@cf/qwen/qwen3-embedding-0.6b',
      // 2026-07 A/B:qwen3-30b 中文质量最好且比 llama-3.3-70b 便宜约 6 倍;
      // glm-4.7-flash 会随机空回答/超时;llama-3.3-70b 快但中文答案偷懒。
      ai_search_model: '@cf/qwen/qwen3-30b-a3b-fp8',
      chunk_size: 512,
      // 重叠为百分比(0-30)
      chunk_overlap: 15,
      max_num_results: 10,
      index_method: { vector: true, keyword: true },
      // trigram 分词对中日文关键词检索友好
      indexing_options: { keyword_tokenizer: 'trigram' },
      cache: false,
      // md5:同步脚本无状态增量比对;url:文档在站点上的真实 permalink
      custom_metadata: [
        { field_name: 'md5', data_type: 'text' },
        { field_name: 'url', data_type: 'text' },
      ],
    };
    try {
      await env.AI_SEARCH.create({ id: INSTANCE_ID, ...config });
      return Response.json({ created: INSTANCE_ID, config });
    } catch (err) {
      // 已存在则更新(embedding 模型等索引参数不可变,忽略其中的失败项)
      const message = String(err?.message ?? err);
      if (/exist/i.test(message)) {
        const updated = await instance(env).update({
          ai_search_model: config.ai_search_model,
          max_num_results: config.max_num_results,
          cache: config.cache,
          custom_metadata: config.custom_metadata,
        });
        return Response.json({ updated: INSTANCE_ID, result: updated });
      }
      throw err;
    }
  }

  // 列出全部文档(含内容 md5,供同步脚本增量比对)
  if (path === '/api/rag/items' && request.method === 'GET') {
    const items = [];
    let page = 1;
    for (;;) {
      const { result, result_info } = await instance(env).items.list({ page, per_page: 50 });
      for (const item of result) {
        items.push({
          id: item.id,
          key: item.key,
          status: item.status,
          md5: item.metadata?.md5 ?? null,
          url: item.metadata?.url ?? null,
        });
      }
      if (items.length >= (result_info?.total_count ?? 0) || result.length === 0) break;
      page += 1;
    }
    return Response.json({ items });
  }

  // 上传文档(x-content-md5 头、?url= 参数会存为 item metadata)
  if (path.startsWith('/api/rag/items/') && request.method === 'PUT') {
    const key = decodeURIComponent(path.slice('/api/rag/items/'.length));
    if (!key) return jsonError('缺少文档 key', 400);
    const content = await request.arrayBuffer();
    if (content.byteLength === 0) return jsonError('内容为空', 400);
    if (content.byteLength > 4 * 1024 * 1024) return jsonError('超过 4MB 限制', 413);
    const metadata = {};
    const md5 = request.headers.get('x-content-md5');
    const pageUrl = url.searchParams.get('url');
    if (md5) metadata.md5 = md5;
    if (pageUrl) metadata.url = pageUrl;
    const result = await instance(env).items.upload(
      key,
      content,
      Object.keys(metadata).length > 0 ? { metadata } : undefined,
    );
    return Response.json({ uploaded: result });
  }

  // 删除文档(按 item id)
  if (path.startsWith('/api/rag/items/') && request.method === 'DELETE') {
    const itemId = decodeURIComponent(path.slice('/api/rag/items/'.length));
    if (!itemId) return jsonError('缺少 item id', 400);
    await instance(env).items.delete(itemId);
    return Response.json({ deleted: itemId });
  }

  // 索引统计
  if (path === '/api/rag/stats' && request.method === 'GET') {
    const stats = await instance(env).stats();
    return Response.json(stats);
  }

  return jsonError('Not found', 404);
}

function jsonError(message, status) {
  return Response.json({ error: message }, { status });
}
