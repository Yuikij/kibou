# ChatAssistant 组件

博客右下角的 RAG(检索增强生成)聊天助手。检索与生成由 **Cloudflare AI Search** 托管,后端是与站点同源的 Cloudflare Worker(`worker/index.js`),无需任何自建服务器。

## 架构

```
浏览器聊天窗 ──POST /api/chat(SSE 流)──▶ kibou Worker(worker/index.js)
                                              │
                                              ▼
                            Cloudflare AI Search 实例 kibou-rag
                    (内置存储 + qwen3 embedding + 混合检索 + Workers AI 生成)
```

- 知识库内容:仓库的 `docs/` 与 `blog/` markdown,通过 `yarn sync-rag`(`scripts/sync-knowledge.mjs`)增量同步。
- 多轮对话:无状态设计,前端每次把完整消息历史发给后端,由 AI Search 的 query rewrite 结合上下文改写检索词。

## 功能特性

- 多轮对话(前端携带历史,后端查询重写)
- 回答流式输出(SSE)
- 参考来源展示,可点击跳转原文(blog/docs 路径自动转站内 URL)
- 检索范围切换:全部 / 文档(docs)/ 博客(blog)
- Markdown 渲染,深浅色主题自适应,移动端适配

## API 协议

### 请求

`POST /api/chat`

```json
{
  "messages": [
    { "role": "user", "content": "博客里怎么讲 MySQL 隔离级别的?" },
    { "role": "assistant", "content": "..." },
    { "role": "user", "content": "默认是哪一种?" }
  ],
  "scope": "docs"
}
```

- `messages`:必填,最后一条必须是 `user`;后端只保留最近 16 条,单条截断到 4000 字符。
- `scope`:可选,`docs` 或 `blog`,按 folder 前缀过滤检索范围。

### 响应(SSE)

```
event: sources
data: [{"filePath":"docs/database/MySQL/事务/隔离级别.md","fileName":"隔离级别.md","snippet":"...","score":0.82}]

data: {"delta":"MySQL"}
data: {"delta":" 的隔离级别"}
...
data: [DONE]
```

## 配置

`src/config/chatConfig.js`:

| 配置 | 说明 |
|------|------|
| `apiEndpoint` | API 地址,默认同源 `/api/chat` |
| `baseUrl` | 站点 baseUrl,用于把来源文件路径转成站内链接 |
| `ui` / `features` | 浮窗位置、窗口大小、功能开关 |

注意:`yarn start` 本地开发时没有 Worker,聊天接口会 404;可用 `yarn preview`(build + wrangler dev)完整联调。

## 知识库同步

```bash
# 需要 .dev.vars 里有 SYNC_SECRET(与 `wrangler secret put SYNC_SECRET` 一致)
yarn sync-rag            # 增量同步 docs/ + blog/ 到 AI Search
node scripts/sync-knowledge.mjs --dry-run   # 预览变更
node scripts/sync-knowledge.mjs --full      # 强制全量重传
```

内容变更(新增/修改/删除文章)后跑一次即可,上传的文档几秒到几分钟内完成索引。
