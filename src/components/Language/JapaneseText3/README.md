# JapaneseText 组件

一个简洁优雅的日语文本显示组件，专为日语学习和阅读设计。

## 功能

- **注音 (Furigana)** — 汉字上方显示假名读音
- **翻译对照** — 原文下方显示中文翻译
- **笔记系统** — 点击高亮词汇查看笔记（词汇/语法/文化/发音）
- **行号** — 可选行号显示
- **暗色主题** — 自动适配 Docusaurus 主题

## 使用方法

```jsx
import JapaneseText from '@site/src/components/Language/JapaneseText3';

<JapaneseText
  texts={["熱い涙や恋の叫びも"]}
  translations={["无论是热泪还是爱的呼唤"]}
  annotations={[{ 熱: "あつ", 涙: "なみだ" }]}
/>
```

## API

| Prop | 类型 | 说明 |
|------|------|------|
| `texts` | `string[]` | 日文文本数组 |
| `translations` | `string[]` | 对应翻译数组 |
| `annotations` | `object[]` | 注音数据，`{ 汉字: "假名" }` |
| `notes` | `object` | 笔记数据 |
| `fullText` | `array[]` | 完整数据格式 `[[text, annotation, translation], ...]` |

## 架构

```
JapaneseText3/
├── index.js              # 主组件
├── JapaneseText.module.css
├── components/
│   ├── AnnotatedText.js  # 注音 + 笔记渲染
│   ├── ControlPanel.js   # 工具栏
│   ├── TextBlock.js      # 句子容器
│   ├── LineNumber.js     # 行号
│   └── ErrorBoundary.js  # 错误边界
├── hooks/
│   ├── useTextParsing.js # 文本解析
│   ├── useNoteHandling.js# 笔记管理
│   └── useLocalStorage.js# 偏好持久化
├── utils/
│   ├── constants.js      # 配置常量
│   ├── textProcessing.js # 文本处理
│   └── validation.js     # 数据验证
└── styles/
    ├── index.css          # 样式入口
    └── variables.css      # 设计令牌
```
