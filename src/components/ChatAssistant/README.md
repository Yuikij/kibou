# ChatAssistant 组件

一个支持多轮 RAG（检索增强生成）对话的聊天助手组件。

## 功能特性

- ✨ 支持多轮对话，自动维护会话上下文
- 🎨 响应式设计，适配移动端和桌面端
- 🌓 自动适配浅色/深色主题
- 📚 显示答案的参考来源和文档
- 🔗 参考来源可点击跳转到原文（blog/docs）
- 📝 Markdown 格式渲染（列表、粗体、代码等）
- 🔍 支持文件路径和扩展名过滤
- ⚡ 实时消息流式显示
- 🎯 优雅的用户交互体验

## 使用方法

### 基础使用

组件已经通过 `src/theme/Root.js` 集成到全局，无需额外导入。

### 自定义 API 端点

如果需要自定义 API 端点，可以修改 `Root.js`:

```jsx
<ChatAssistant apiEndpoint="http://your-custom-endpoint:8080/api/v1/chat" />
```

### Props

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `apiEndpoint` | `string` | `http://127.0.0.1:8080/api/v1/chat` | RAG 服务的 API 端点 |

## API 接口说明

### 请求格式

```json
{
  "question": "你的问题",
  "sessionId": "session_abc123...",  // 可选，用于多轮对话
  "filePathFilter": "/path/to/file.md",  // 可选，过滤特定文件
  "fileExtensionFilter": "md"  // 可选，过滤特定扩展名
}
```

### 响应格式

```json
{
  "answer": "回答内容...",
  "sessionId": "session_abc123...",
  "sources": [
    {
      "filePath": "/path/to/document.md",
      "fileName": "document.md",
      "section": "Introduction",
      "snippet": "This document describes..."
    }
  ],
  "metadata": {
    "documentsSearched": 5,
    "responseTimeMs": 1234
  }
}
```

## 功能说明

### 多轮对话

组件会自动管理 `sessionId`，实现多轮对话功能：

1. 首次对话不传 `sessionId`，服务器会返回新的会话 ID
2. 后续对话自动使用该会话 ID，保持上下文连贯
3. 点击"清空对话"按钮可以重置会话

### 过滤器

点击头部的过滤器图标可以设置：

- **文件路径过滤**：只在指定路径的文件中搜索
- **文件扩展名过滤**：只搜索特定类型的文件（如 md, txt 等）

### 消息类型

组件支持三种消息类型：

- **用户消息**：蓝紫色渐变背景，靠右显示
- **助手消息**：浅灰色背景，靠左显示，包含来源信息
- **错误消息**：红色背景，显示错误信息

### 来源信息

助手的回答会显示参考来源，包括：

- **可点击的文件名**：自动识别 blog 和 docs 文章，点击跳转到原文
- 章节信息
- 相关文本片段
- 完整文件路径
- 搜索的文档数量和响应时间

#### 支持的路径格式

- `blog/YYYY-MM-DD-文章标题.mdx` → `/kibou/blog/文章标题`
- `docs/路径/文件.md` → `/kibou/docs/路径/文件`
- `documents/` 开头的路径：显示但不可点击（外部文档）

## 样式定制

组件使用 CSS Modules，样式文件位于 `styles.module.css`。

主要的 CSS 变量：

- 浮动按钮位置：`bottom: 30px; right: 30px;`
- 聊天窗口大小：`width: 420px; height: 600px;`
- 主题色：渐变色 `#667eea` 到 `#764ba2`

可以通过修改这些变量来自定义样式。

## 键盘快捷键

- `Enter`：发送消息
- `Shift + Enter`：换行

## 浏览器兼容性

- Chrome/Edge: ✅
- Firefox: ✅
- Safari: ✅
- 移动浏览器: ✅

## 注意事项

1. 确保 RAG 服务已启动并可访问
2. 检查 CORS 配置，确保前端可以访问后端 API
3. 会话会在服务器端自动清理（默认 30 分钟无活动后）
4. 组件使用 `fetch` API，需要现代浏览器支持

## 开发调试

在开发环境中，可以通过浏览器控制台查看：

- API 请求和响应
- 错误信息
- 会话 ID

## 未来改进

- [ ] 支持流式响应
- [ ] 添加消息编辑和重新生成功能
- [ ] 导出对话历史
- [ ] 语音输入支持
- [ ] 代码块语法高亮
- [ ] Markdown 渲染支持

