# 简介
## 定义
> A system is distributed if the message transmission delay is not negligible compared to the time between events in a single process.

> a group of computers cooperating to provide a service

1. 若干个可以独立自治，有自己的内存空间的计算实体（计算机，节点甚至进程）
2. 实体之间通过消息传递进行通信、交换信息，而且通信时长相对于单进程的通信时间不可以忽略不计 
3. 分布式系统可能有一个共同的目标，对内负责协调各个单元
## 为什么
1. 通过并行处理提高性能
2. 通过复制提高容错
3. 适配设备的物理分布
4. 通过隔离提高安全性