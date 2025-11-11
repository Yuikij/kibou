# 🎉 RAG 聊天助手 - 更新日志

## 最新更新 (2024-11-11)

### ✨ 新增功能

#### 1. Markdown 渲染支持
- ✅ 助手回答支持完整的 Markdown 格式
- ✅ 列表（有序/无序）正确显示
- ✅ 粗体、斜体、代码高亮
- ✅ 代码块、引用、标题等格式
- ✅ 所有样式自动适配主题

**效果示例：**
```
根据提供的游记内容，这次桂林之行是作者在十一国庆节前几天的记录。

行程概要如下：

• 出发: 旅行从一个中秋节的早晨开始...
• 第一天: 抵达桂林后...
• 第二天: 作者起了个大早...
```

#### 2. 参考来源可点击跳转 🔗
- ✅ 自动识别 blog 和 docs 文章路径
- ✅ 点击文件名跳转到原文
- ✅ 新标签页打开，不影响聊天
- ✅ 显示外链图标提示
- ✅ 悬停效果和颜色变化

**路径转换规则：**
- `blog/2025-03-17-文章标题.mdx` → `/kibou/blog/文章标题`
- `docs/intro.md` → `/kibou/docs/intro`
- `documents/` 路径显示但不可点击

#### 3. 完整文件路径显示
- ✅ 在来源卡片底部显示完整路径
- ✅ 使用等宽字体，易于识别
- ✅ 鼠标悬停显示完整路径（防止截断）

### 🔧 配置增强

#### 新增配置项

在 `src/config/chatConfig.js` 中添加：

```javascript
{
  // Docusaurus baseUrl 配置
  baseUrl: '/kibou/',  // 根据实际部署路径修改
}
```

**用途：**
- 根据不同的部署环境自动调整链接
- 支持根目录部署（`/`）和子路径部署（如 `/kibou/`）

### 🎨 样式优化

#### Markdown 样式
- 段落间距优化
- 列表缩进和标记样式
- 代码块背景和圆角
- 引用边框和斜体
- 标题大小层级
- 链接颜色和悬停效果

#### 链接样式
- 紫色渐变主题色
- 外链图标（SVG）
- 悬停动画效果
- 活跃状态反馈

### 🐛 Bug 修复

#### 1. React Context 错误修复
**问题：** `useColorMode` hook 在 Root.js 中无法使用

**解决方案：**
- 移除对 `useColorMode` 的依赖
- 改用 CSS 变量自动适配主题
- 所有颜色使用 `--ifm-` 开头的变量

**优势：**
- 无需管理主题状态
- 主题切换更流畅
- 代码更简洁

#### 2. process.env 错误修复
**问题：** 浏览器环境中 `process` 对象不可用

**解决方案：**
- 移除环境变量依赖
- 直接在配置文件中设置值
- 更简单的配置方式

## 📋 完整功能列表

### 核心功能
- ✅ 多轮对话（自动管理 sessionId）
- ✅ Markdown 渲染
- ✅ 参考来源展示
- ✅ 点击跳转原文
- ✅ 文件路径过滤
- ✅ 文件扩展名过滤
- ✅ 主题自动适配
- ✅ 响应式设计

### UI 特性
- ✅ 浮动聊天按钮
- ✅ 可展开/收起窗口
- ✅ 消息列表滚动
- ✅ 加载动画
- ✅ 时间戳显示
- ✅ 元数据信息（搜索文档数、响应时间）
- ✅ 过滤器面板
- ✅ 清空对话功能

### 交互体验
- ✅ Enter 发送消息
- ✅ Shift+Enter 换行
- ✅ 自动滚动到底部
- ✅ 输入框自动聚焦
- ✅ 禁用状态处理
- ✅ 错误提示

## 🎯 使用示例

### 示例对话

**问：** 讲一下桂林之行

**答：**
```
根据提供的游记内容，这次桂林之行是作者在十一国庆节前几天的记录。

行程概要如下：

• 出发: 旅行从一个中秋节的早晨开始，作者从刚经历过台风、还下着雨的南京出发。这是作者第一次坐飞机。
• 第一天: 抵达桂林后，作者对这座城市的印象是"被山包围"。当天入住了象山景区附近的喜来登酒店，并在中秋节的夜晚游览了象鼻山、两江四湖和日月双塔。
• 第二天: 作者起了个大早前往阳朔，乘坐游船游览了漓江，当天的天气很好。

📚 参考来源：
┌─────────────────────────────────────┐
│ 2024-09-29-桂林之行.mdx 🔗          │
│ 章节: 夜色                           │
│ blog/2024-09-29-桂林之行.mdx        │
└─────────────────────────────────────┘
```

点击文件名即可跳转到完整文章！

## ⚙️ 配置说明

### 1. API 端点

编辑 `src/config/chatConfig.js`：

```javascript
apiEndpoint: 'http://127.0.0.1:8080/api/v1/chat',
```

### 2. Base URL

根据你的部署环境设置：

```javascript
// GitHub Pages 部署在子路径
baseUrl: '/kibou/',

// 或部署在根目录
baseUrl: '/',
```

### 3. 其他配置

```javascript
{
  // 默认过滤器
  defaultFilters: {
    filePathFilter: '',
    fileExtensionFilter: '',
  },
  
  // UI 配置
  ui: {
    position: { bottom: '30px', right: '30px' },
    chatWindow: { width: '420px', height: '600px' },
  },
  
  // 功能开关
  features: {
    showFilters: true,
    showSources: true,
    showMetadata: true,
  },
}
```

## 🧪 测试

打开浏览器控制台，运行：

```javascript
// 测试连接
window.testChatAPI.testConnection()

// 测试多轮对话
window.testChatAPI.testMultiTurn()

// 运行完整测试
window.testChatAPI.runAll()
```

## 📝 技术细节

### 路径转换逻辑

```javascript
// Blog 文章
blog/2025-03-17-两个人的话，去1912散步也是可以的.mdx
↓
1. 移除 'blog/' 前缀
2. 移除文件扩展名
3. 移除日期前缀 (YYYY-MM-DD-)
4. 拼接 baseUrl
↓
/kibou/blog/两个人的话，去1912散步也是可以的

// Docs 文档
docs/intro.md
↓
1. 移除 'docs/' 前缀
2. 移除文件扩展名
3. 拼接 baseUrl
↓
/kibou/docs/intro
```

### Markdown 渲染

使用 `react-markdown` 库：
- 自动处理段落、列表、代码块
- CSS Modules 隔离样式
- `:global()` 选择器应用全局样式

### 主题适配

使用 Docusaurus CSS 变量：
- `--ifm-background-color`
- `--ifm-font-color-base`
- `--ifm-color-primary`
- `--ifm-color-emphasis-*`

## 🎓 最佳实践

### 1. 部署前检查

- [ ] 确认 `baseUrl` 配置正确
- [ ] 测试 blog 和 docs 链接跳转
- [ ] 检查主题切换效果
- [ ] 验证移动端显示

### 2. 性能优化

- 使用 React.memo 优化消息列表
- 懒加载 Markdown 组件
- 节流滚动事件

### 3. 错误处理

- API 请求失败显示友好提示
- 路径转换失败降级处理
- 网络超时重试机制

## 🔄 版本历史

### v1.1.0 (2024-11-11)
- ✨ 新增 Markdown 渲染
- ✨ 新增可点击的参考来源
- ✨ 新增文件路径显示
- 🐛 修复主题切换问题
- 🐛 修复环境变量问题
- 🎨 优化样式和动画

### v1.0.0 (2024-11-11)
- ✨ 初始版本发布
- 💬 多轮对话支持
- 🔍 文件过滤功能
- 📚 参考来源显示

## 📚 相关文档

- [完整使用指南](./CHAT_ASSISTANT_GUIDE.md)
- [功能总结](./CHAT_FEATURE_SUMMARY.md)
- [验证清单](./CHECKLIST.md)
- [组件文档](./src/components/ChatAssistant/README.md)

---

**更新完成！** 🎉 现在就试试新功能吧！

