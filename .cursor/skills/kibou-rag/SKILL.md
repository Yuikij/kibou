---
name: kibou-rag
description: 维护和扩展本博客的 RAG 问答系统(Cloudflare AI Search 实例 kibou-rag + Worker 聊天接口 + 知识库同步脚本)。当用户提到 RAG、聊天助手、喵帕斯、AI 问答、知识库同步、sync-rag、AI Search、/api/chat、检索质量、来源引用,或要修改 worker/index.js 与 scripts/sync-knowledge.mjs 时使用。
---

# kibou 博客 RAG 系统运维

## 架构一句话

git 仓库(docs/ + blog/ 的 markdown)是唯一事实源 → `scripts/sync-knowledge.mjs` 增量同步到 Cloudflare AI Search 实例 `kibou-rag`(内置存储,托管切片/embedding/混合检索/生成)→ 同一个 Worker(`worker/index.js`)同时服务静态站和 `/api/chat`(SSE 流式,同源无 CORS)→ 前端 `src/components/ChatAssistant/`(浮窗 + /chat 页共用 useChat/ChatMessages)。

## 关键文件

| 文件 | 职责 |
|---|---|
| `worker/index.js` | `/api/chat` 聊天(SSE 转译、行内引用 refMap);`/api/rag/*` 管理接口(Bearer SYNC_SECRET);`/api/rag/setup` 里的 `config` 是**实例配置的唯一事实源** |
| `scripts/sync-knowledge.mjs` | 三方对账式增量同步:本地文件树 vs 远端列表 vs 内容 md5;上传时注入 `[文档信息] 标题|日期|位置` 头;从 `.docusaurus/` 读真实 permalink 存进 url metadata |
| `src/components/ChatAssistant/` | useChat.js(SSE 解析)、ChatMessages.jsx(渲染+智能滚动)、utils.js(引用角标 renderCitations) |
| `.dev.vars` | 本地 SYNC_SECRET(与 Worker secret 及 CI 构建环境变量同值,gitignore) |

## 常用操作

```bash
yarn deploy                                  # build + wrangler deploy + 知识库同步(一条龙)
yarn sync-rag                                # 只同步知识库(需先有 .docusaurus 构建产物)
node scripts/sync-knowledge.mjs --dry-run    # 预览将要 PUT/DELETE 的文档
node scripts/sync-knowledge.mjs --full       # 强制全量重传(改了注入头格式后 md5 变化会自动触发,一般用不到)
npx wrangler ai-search get kibou-rag --json  # 查看实例配置
```

管理接口调试(密钥在 .dev.vars):

```bash
source <(grep SYNC_SECRET .dev.vars | sed 's/SYNC_SECRET="\(.*\)"/export SYNC_SECRET=\1/')
curl -s https://yuisama.top/api/rag/stats -H "Authorization: Bearer $SYNC_SECRET"   # 索引进度
curl -s https://yuisama.top/api/rag/items -H "Authorization: Bearer $SYNC_SECRET"   # 全部文档(含 md5/url/status)
```

检索质量排查(直接看检索层,绕过生成):

```bash
npx wrangler ai-search search kibou-rag --query "问题" --max-num-results 8 --json
```

## 改配置的正确方式

**改 `worker/index.js` 里 `/api/rag/setup` 的 `config`,然后跑一次 `yarn sync-rag`。**
用 wrangler/dashboard 直接改实例配置会在下一次同步时被 setup 路由刷回代码里的值。

- 生成模型(`ai_search_model`):随时可换,当前 `@cf/qwen/qwen3-30b-a3b-fp8`(2026-07 A/B:中文质量与价格最优;glm-4.7-flash 会随机空回答;llama-3.3-70b 贵 6 倍且中文偷懒)。
- embedding 模型:**建索引后不可更换**,换=删实例全量重建。
- 系统提示词 `SYSTEM_PROMPT` 在 worker/index.js 顶部,含引用编号规则和"[文档信息] 行使用示例"(few-shot,删了模型就不会答日期类问题)。

## 已知雷区(改动前必读)

1. `chunk_overlap` 是百分比(0-30),不是 token 数。
2. **不要加 `retrieval.context_expansion`**:与自定义 metadata 同用触发 AI Search 后端 Internal Error(2026-07 实测,代码里有注释)。
3. 查询重写只在多轮时开(`enabled: messages.length > 1`):首轮改写会偏移原意;自定义 rewrite_prompt 强制保持中文,删掉会退化成英文改写。
4. 检索过滤器用 Mongo 风格:`{ folder: { $gte: "blog/", $lt: "blog0" } }`;compound 格式(type/key/value)会报 Invalid input。
5. 前端表格渲染依赖 `remark-gfm` 插件(ChatMessages.jsx),别删。
6. 来源 URL 以 item metadata 的 `url`(真实 permalink)为准,不要按文件路径拼(Docusaurus 会剥离 `NN-` 数字前缀导致 404)。
7. sources 事件的顺序即引用编号:buildCitations 按分块首次出现排序、不截断;改成按分数排序会导致行内 [n] 角标对不上号。
8. 空文件和纯空白文件同步时跳过;索引失败(status=error)的文档无 md5,每次同步自动重试,`docs/memorandum/SuperGame/文学作品.md` 是已知常驻 error(embedding 端拒收),忽略即可。

## 验证清单(改完必跑)

```bash
# 1. 单轮 + 引用:应有 sources 事件、delta 流、[DONE]
curl -s -N -X POST https://yuisama.top/api/chat -H 'Content-Type: application/json' \
  -d '{"messages":[{"role":"user","content":"博客里怎么讲 MySQL 隔离级别?"}]}' | head -40
# 2. 日期类问题(验证元数据头链路):期望答出 2025-03-17
#    问:"作者哪天去了1912?"
# 3. scope 过滤:body 加 "scope":"blog",来源应全部是 blog/ 前缀
```

改了前端(ChatAssistant/)需要 `yarn build` 后再 deploy;只改 worker 直接 `npx wrangler deploy` 即可(不重传静态资产)。CI(Workers Builds)push 后会用仓库代码执行 `yarn deploy`,**本地改完必须 commit + push,否则下次 CI 构建会回滚线上配置**。
