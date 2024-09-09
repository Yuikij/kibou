---
sidebar_position: 1
description: SpringIoc
keywords:
  - Spring
  - SpringIoc
tags: [Spring]
last_update:
  date: 1/1/2000
  author: custom author name
---

## bean的生命周期
## bean的作用域
| 作用域  | 描述  |
|---|---|
| singleton  | 单例，默认作用域  |
| prototype  | 原型，有状态   |
| request  | 每次 HTTP 请求都会创建一个新的 Bean 实例请求  |
| session  | 一个session会话中，修改或删除cookie会重新创建bean  |
| application  | web应用上下文，和singleton范围差不多  |
| websocket  | 每次 WebSocket 会话创建  |

> * 一般都是用 singleton，不用bean对象存储任何状态
> * request 可以在一次请求里存储一些临时的状态
> * 目前没遇到过spring容器和web容器不是一个的情况

## 自动注入