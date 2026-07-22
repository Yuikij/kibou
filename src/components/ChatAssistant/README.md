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
- 行内引用角标 [1][2],点击直达对应原文
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
data: {"sources":[{"filePath":"docs/database/MySQL/事务/隔离级别.md","fileName":"隔离级别.md","snippet":"...","score":0.82}],"refMap":{"1":1,"2":1,"3":2}}

data: {"delta":"MySQL"}
data: {"delta":" 的隔离级别 [1]"}
...
data: [DONE]
```

- `sources` 按文件去重,顺序即来源编号(1 起)。
- 回答文本里的 `[n]` 是模型对检索材料(分块)的引用,`refMap` 把材料编号换算成来源编号;前端渲染成可点击的角标,点击直达原文。

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
yarn sync-rag            # 增量同步 docs/ + blog/ 到 AI Search(已包含在 yarn deploy 里)
node scripts/sync-knowledge.mjs --dry-run   # 预览变更
node scripts/sync-knowledge.mjs --full      # 强制全量重传
```

- 密钥:脚本读环境变量 `SYNC_SECRET`(本地放 `.dev.vars`;Workers Builds CI 里配置同名构建环境变量),值需与 Worker 的 secret 一致。
- 增量机制是无状态的:上传时把内容 md5 写进 item metadata,每次同步拉远端列表比对 md5,只传新增/变更、删除仓库里已不存在的文档。本地、CI、任何机器跑效果一致。
- 上传正文前会注入一行 `[文档信息] 标题: … | 日期: … | 位置: …`(从 frontmatter/文件名推导):标题和日期常常只在文件名里,不注入则"哪天去了1912"这类问题检索不到也答不出。系统提示词教会了模型使用这一行。
- 每篇文档的真实 permalink(来自 `.docusaurus` 构建元数据)也存进 item metadata,来源链接以它为准。
- 索引失败(status=error)的文档不会记录 md5,每次同步会自动重试。
