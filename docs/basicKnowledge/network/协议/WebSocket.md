> WebSocket是一种网络传输协议，可在单个TCP连接上进行全双工通信，位于OSI模型的应用层。浏览器和服务器只需要完成一次握手，两者之间就可以建立持久性的连接，并进行双向数据传输。
## 特点
* 全双工，互相发送消息，而无需客户端轮询
* 长连接，一次握手，长期有效
* 低开销：相比 HTTP，WebSocket 的头部信息更小，特别适合频繁的数据交互场景。
## 握手协议
* 客户端通过 HTTP 的 Upgrade 头部向服务器发起协议升级请求
```http
GET /chat HTTP/1.1
Host: server.example.com
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
Sec-WebSocket-Version: 13
Origin: http://example.com
```
* 服务器响应
```http
HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=
```
### 字段说明
* Connection必须设置Upgrade，表示客户端希望连接升级
* Upgrade字段必须设置Websocket，表示希望升级到Websocket协议
* Sec-WebSocket-Key是随机的字符串，服务器端会用这些数据来构造出一个SHA-1的信息摘要。把“Sec-WebSocket-Key”加上一个特殊字符串“258EAFA5-E914-47DA-95CA-C5AB0DC85B11”，然后计算SHA-1摘要，之后进行Base64编码，将结果做为“Sec-WebSocket-Accept”头的值，返回给客户端。如此操作，可以尽量避免普通HTTP请求被误认为Websocket协议
* Sec-WebSocket-Version 表示支持的Websocket版本。RFC6455要求使用的版本是13，之前草案的版本均应当弃用
* Origin字段是必须的。如果缺少origin字段，WebSocket服务器需要回复HTTP 403 状态码（禁止访问）

## 数据帧格式：
* WebSocket 数据通过帧（frame）传输。每个帧都有固定格式：
* FIN：表示是否是消息的最后一帧。
* Opcode：表示数据类型（文本、二进制、关闭、Ping、Pong）。
* Mask：是否对消息进行掩码（客户端发送的帧必须加掩码）。
* Payload：实际的消息内容。

## 应用
* 即时聊天应用（如微信 Web、Slack 等）。
* 实时更新界面（如股票行情、体育比分）。
* 在线协作工具（如 Google Docs 多人协作编辑）。
* 实时通知系统。
* 在线游戏（如多人对战游戏）。