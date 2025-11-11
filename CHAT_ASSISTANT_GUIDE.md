# 🤖 RAG 聊天助手 - 快速入门指南

## 📋 目录

- [功能介绍](#功能介绍)
- [项目结构](#项目结构)
- [快速开始](#快速开始)
- [配置说明](#配置说明)
- [API 接口](#api-接口)
- [常见问题](#常见问题)

## ✨ 功能介绍

这是一个基于 RAG（检索增强生成）技术的智能文档助手，主要特性包括：

- 💬 **多轮对话**：自动维护会话上下文，支持连续对话
- 🔍 **智能检索**：从文档库中精准检索相关内容
- 📚 **来源追溯**：显示答案的参考来源，信息可追溯
- 🎨 **主题适配**：自动适配 Docusaurus 的浅色/深色主题
- 🔧 **灵活过滤**：支持按文件路径和扩展名过滤
- 📱 **响应式设计**：完美适配各种设备

## 📁 项目结构

```
src/
├── components/
│   └── ChatAssistant/
│       ├── index.jsx          # 主组件
│       ├── styles.module.css  # 样式文件
│       └── README.md          # 组件文档
├── config/
│   └── chatConfig.js          # 配置文件
├── theme/
│   └── Root.js                # 全局根组件
└── pages/
    ├── chat-demo.jsx          # 演示页面
    └── chat-demo.module.css   # 演示页面样式
```

## 🚀 快速开始

### 1. 启动后端服务

确保你的 RAG 服务正在运行：

```bash
# 默认端口 8080
# 接口地址：http://127.0.0.1:8080/api/v1/chat
```

### 2. 配置 API 端点（可选）

如果你的 API 地址不同，直接修改 `src/config/chatConfig.js`：

```javascript
const chatConfig = {
  apiEndpoint: 'http://your-server:port/api/v1/chat',
  // ... 其他配置
};
```

### 3. 启动开发服务器

```bash
npm start
# 或
yarn start
```

### 4. 使用聊天助手

1. 打开任意页面
2. 点击右下角的紫色浮动按钮
3. 在输入框中输入你的问题
4. 按 Enter 发送消息

### 5. 查看演示页面

访问 `/chat-demo` 页面查看详细的功能介绍和使用示例。

## ⚙️ 配置说明

### 基础配置

编辑 `src/config/chatConfig.js`：

```javascript
const chatConfig = {
  // API 端点
  apiEndpoint: 'http://127.0.0.1:8080/api/v1/chat',
  
  // 默认过滤器
  defaultFilters: {
    filePathFilter: '',
    fileExtensionFilter: '',
  },
  
  // UI 配置
  ui: {
    // 浮动按钮位置
    position: {
      bottom: '30px',
      right: '30px',
    },
    // 聊天窗口大小
    chatWindow: {
      width: '420px',
      height: '600px',
    },
    // 是否默认展开
    defaultOpen: false,
  },
  
  // 功能开关
  features: {
    showFilters: true,    // 显示过滤器
    showSources: true,    // 显示来源信息
    showMetadata: true,   // 显示元数据
  },
};
```

### 样式自定义

修改 `src/components/ChatAssistant/styles.module.css` 中的样式变量：

```css
/* 主题色 */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* 浮动按钮位置 */
.floatingButton {
  bottom: 30px;
  right: 30px;
}

/* 聊天窗口大小 */
.chatContainer {
  width: 420px;
  height: 600px;
}
```

## 🔌 API 接口

### 请求格式

**POST** `/api/v1/chat`

```json
{
  "question": "你的问题",
  "sessionId": "session_abc123...",  // 可选，用于多轮对话
  "filePathFilter": "/path/to/file.md",  // 可选，文件路径过滤
  "fileExtensionFilter": "md"  // 可选，文件扩展名过滤
}
```

### 响应格式

```json
{
  "answer": "回答内容...",
  "sessionId": "session_abc123...",  // 会话ID
  "sources": [
    {
      "filePath": "/path/to/document.md",
      "fileName": "document.md",
      "section": "Introduction",
      "snippet": "相关文本片段..."
    }
  ],
  "metadata": {
    "documentsSearched": 5,
    "responseTimeMs": 1234
  }
}
```

### CORS 配置

如果遇到 CORS 错误，需要在后端配置允许跨域：

```go
// 示例：Go 语言后端
router.Use(cors.New(cors.Config{
    AllowOrigins:     []string{"http://localhost:3000"},
    AllowMethods:     []string{"GET", "POST", "OPTIONS"},
    AllowHeaders:     []string{"Content-Type"},
    AllowCredentials: true,
}))
```

## 💡 使用技巧

### 多轮对话

组件会自动管理会话 ID，实现上下文理解：

```
用户：什么是 chunk size？
助手：Chunk size 是文档分块的大小...

用户：它的默认值是多少？  ← 助手能理解"它"指的是 chunk size
助手：默认值是 512...
```

### 使用过滤器

点击头部的过滤器图标，设置搜索范围：

- **文件路径过滤**：如 `/docs/tutorial/`
- **文件扩展名过滤**：如 `md`, `txt`, `js`

### 清空对话

点击头部的垃圾桶图标可以：
- 清空当前所有消息
- 重置会话 ID
- 清除过滤器设置

### 键盘快捷键

- `Enter`：发送消息
- `Shift + Enter`：在输入框中换行

## ❓ 常见问题

### 1. 聊天按钮不显示？

检查：
- Root.js 是否正确配置
- 浏览器控制台是否有错误
- 组件是否正确导入

### 2. 发送消息没有响应？

检查：
- 后端服务是否启动
- API 端点配置是否正确
- 浏览器网络面板查看请求状态
- CORS 配置是否正确

### 3. 样式显示异常？

检查：
- CSS Modules 是否正常工作
- 浏览器是否支持 CSS 变量
- 主题切换是否正常

### 4. 移动端显示问题？

组件已经做了响应式适配，如果有问题：
- 检查视口 meta 标签
- 清除浏览器缓存
- 在真实设备上测试

### 5. 如何调试？

打开浏览器控制台，组件会输出：
- API 请求详情
- 错误信息
- 会话 ID

```javascript
// 在组件中可以看到类似的日志
console.error('Error sending message:', error);
```

## 🔧 开发与扩展

### 添加新功能

1. 在 `index.jsx` 中添加新的状态和处理函数
2. 在 `styles.module.css` 中添加相应样式
3. 更新 `chatConfig.js` 添加配置选项

### 测试

```bash
# 构建测试
npm run build

# 本地预览
npm run serve
```

## 📝 更新日志

### v1.0.0 (2024-11-11)

- ✨ 初始版本发布
- 💬 支持多轮对话
- 🔍 实现文件过滤功能
- 📚 显示参考来源
- 🎨 主题自适应
- 📱 响应式设计

## 🤝 贡献

如果你有任何建议或发现问题，欢迎：
- 提交 Issue
- 发起 Pull Request
- 完善文档

## 📄 许可证

MIT License

---

**祝你使用愉快！** 🎉

如有问题，请查看 [组件文档](./src/components/ChatAssistant/README.md) 或访问 [演示页面](/chat-demo)。

