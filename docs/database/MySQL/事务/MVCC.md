> MVCC的核心还是读写分离，提高并发性能

## 核心组件和实现原理

### 隐藏字段
* DB_TRX_ID（事务 ID）: 记录创建该行数据的事务 ID，或者最后一次修改该行数据的事务 ID。
* DB_ROLL_PTR（回滚指针）: 指向该行数据的前一个版本（存储在 undo log 中），用于构建数据的版本链。
* DB_ROW_ID（行 ID）: 一个自增的行标识符（仅在没有主键时使用）。

### Read View (读视图,  也称为 Snapshot):
Read View 定义了事务在某个时间点可以“看到”哪些版本的数据快照。不是全局的，每个事务都有它的一份Read View
* m_ids: 当前活跃（未提交）事务 ID 的列表。
* min_trx_id: 活跃事务中最小的 ID。
* max_trx_id: 当前分配的最大事务 ID（下一个即将分配的 ID）。
  * 为什么max_trx_id!=creator_trx_id+1，因为1、Read View是在第一次查询的时候创建的 2、并发环境下
* creator_trx_id: 当前事务自己的 ID。
  
### 如何找到该事务某行的正确record（目标：找到可见版本）
* 读取某行的隐藏字段，找到最后一次修改该行数据的事务 ID：DB_TRX_ID
* 根据DB_TRX_ID与Read View ，判断当前读到的行是否可见。如果可见则返回
* 如果不可见，则根据DB_ROLL_PTR回溯到更早的版本，重复上面判断步骤