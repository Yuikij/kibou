## 评论
* 管理页面：https://waline-sigma-rose.vercel.app/ui
## linux
* 进入后台
```shell
tmux attach -t \<session-name\>
```

* 启动 tmux 会话：
```shell
tmux new -s \<session-name\>
```

* 查看会话列表
```shell
tmux list-windows
```
## vscode
* 用ctrl v 或者ctrl t 打开主题设置
## docusaurus
* emoji
https://symbl.cc/cn/emoji/symbols/
* 提示
```js
import Admonition from '@theme/Admonition';

export default function MyReactPage() {
  return (
    <div>
      <Admonition type="tip" icon="💡" title="Did you know...">
        Use plugins to introduce shorter syntax for the most commonly used JSX
        elements in your project.
      </Admonition>
    </div>
  );
}
```


* md中的元数据
https://docusaurus.io/docs/next/api/plugins/@docusaurus/plugin-content-docs#sidebar_position

```mdxjs
---
//侧边栏位置     
sidebar_position: 1
---

```
* 锚点
url后面的#xxx，xxx可以是id
* idea java报红
Settings > Languages & Frameworks > Markdown > Show errors in code fences

* 引入自己的组件
"import JapaneseText from '@site/src/components/Language/JapaneseText';"
* markdown 和 react
https://docusaurus.io/docs/markdown-features/react#importing-markdown

* 展开详情
```mdx
<details>
<summary>展开</summary>
...
</details>
```

## mermaid
* ER图
> https://mermaid.js.org/syntax/entityRelationshipDiagram.html#attribute-keys-and-comments



## vscode_web
使用Chrome实验性功能
在Chrome地址栏中输入 chrome://flags 并回车。
在搜索框中输入 Insecure origins treated as secure。
找到 Insecure origins treated as secure 选项，将其启用。
在输入框中添加你希望允许的HTTP站点，例如 http://example.com。
重启Chrome浏览器。

## mdx
* 语法混合

```mdx
import React from 'react';
import { Row, Col } from 'antd';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Markdown from 'markdown-to-jsx';


## Crow's Foot Notation

<Row gutter={16}>
  <Col span={12}>
    <ReactMarkdown remarkPlugins={[remarkGfm]}>
      {`
    * 分为零，一和多的三种关系
    * 一个方向会有两种关系AB，表示最小A关系最大B关系
`}
    </ReactMarkdown>
       <Markdown>
      {`
    * 分为零，一和多的三种关系
    * 一个方向会有两种关系AB，表示最小A关系最大B关系
`}
   </Markdown>
  </Col>
  <Col span={12}>

      <ReactMarkdown remarkPlugins={[remarkGfm]}>
    {`
| 符号  | 含义  |
|---|---|
| o   | 零  |
| \| | 一  |
| \{  | 多  |
    `}
    </ReactMarkdown>

  </Col>
</Row>

* 分为零，一和多的三种关系
* 一个方向会有两种关系AB，表示最小A关系最大B关系

| 符号  | 含义  |
|---|---|
| o   | 零  |
| \| | 一  |
| \{  | 多  |

``` mermaid
---
title: 示例
---
erDiagram

    "老师" }|--|| "课程" : "每个老师只教一门课程，一门课程会有多个教师"
    "学生" ||--|| "座位" : "一对一"
    "顾客" ||--o{ "订单" : "一个顾客零份到有多份订单，每份订单只属于一个顾客"

```

```