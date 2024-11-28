# Project 3
## 前提：框架代码
#### common/iterator
> 在实现join时需要

``` java
BackTrackingIterator<Integer> iter = new BackTrackingIteratorImplementation();
iter.next();     // returns 1
iter.next();     // returns 2
iter.markPrev(); // marks the previously returned value, 2
iter.next();     // returns 3
iter.hasNext();  // returns false
iter.reset();    // reset to the marked value (line 3)
iter.hasNext();  // returns true
iter.next();     // returns 2
iter.markNext(); // mark the value to be returned next, 3
iter.next();     // returns 3
iter.hasNext();  // returns false
iter.reset();    // reset to the marked value (line 11)
iter.hasNext();  // returns true
iter.next();     // returns 3
```

#### Join Operators
> 所有连接运算符的基类
* 几个关键的接口方法：
  * ` public abstract int estimateIOCost()`：估算查询的I/O成本
#### query/disk
#### Scan and Special Operators
#### query/QueryPlan.java
## 第一部分
### 任务1：Nested Loop Joins
#### 理解Simple Nested Loop Join (SNLJ)
> 简单嵌套循环，重要的就是实现迭代器，嵌套的两个for循环
* estimateIOCost
  ```java
      // PageSize(R)+RecordSize(R)*RecordSize(S)
      public int estimateIOCost() {
        int numLeftRecords = getLeftSource().estimateStats().getNumRecords();
        int numRightPages = getRightSource().estimateStats().getNumPages();
        return numLeftRecords * numRightPages + getLeftSource().estimateIOCost();
    }
  ```
#### Block Nested Loop Join
* estimateIOCost
  ```java
      // PageSize(R)+(PageSize(R)/(B-2))*PageSize(S)
      // numBuffers为缓冲区的页数
      // io成本为左表的总页数/每次读取的页数* 右表的页数+左边的页数
      public int estimateIOCost() {
        int usableBuffers = numBuffers - 2;
        int numLeftPages = getLeftSource().estimateStats().getNumPages();
        int numRightPages = getRightSource().estimateIOCost();
        return ((int) Math.ceil((double) numLeftPages / (double) usableBuffers)) * numRightPages +
                getLeftSource().estimateIOCost();
    }
  ```
* 需要实现的方法：
  * fetchNextLeftBlock
  > 左表每次拿一块出来，**一块即缓冲区的页数-2** , 因为剩下的两页，有一页用来给右表，一页是输出缓存区
  * fetchNextRightPage
  > 右边每次拿出一页
  * fetchNextRecord
  > 得到下一条记录，涉及到两个表的联合
  ```java
        private Record fetchNextRecord() {
            if (leftRecord == null) {
                // The left source was empty, nothing to fetch
                return null;
            }
            /*
            1.拿到一个块，然后去匹配右表
            2.右表每次拿一页
            3.先遍历一块中的元素
            4.再遍历每页的元素
            * */
           // 构造函数里已经获取了左块和右页
            while (true) {
                //去匹配右表
                if (this.rightPageIterator.hasNext()) {
                    // there's a next right record, join it if there's a match
                    // 拿出右页的一条记录，匹配则连接并返回
                    Record rightRecord = rightPageIterator.next();
                    if (compare(leftRecord, rightRecord) == 0) {
                        return leftRecord.concat(rightRecord);
                    }
                // 右页没数据了，但是左块有
                } else if (this.leftBlockIterator.hasNext()) {
                    // there's no more right records but there's still left
                    // records. Advance left and reset right
                    // 左块取一个，右页重置继续遍历
                    this.leftRecord = leftBlockIterator.next();
                    this.rightPageIterator.reset();
                // 两边都没记录了，如果右表还有下一页，取下一页，左边重置
                } else if (this.rightSourceIterator.hasNext()) {
                    fetchNextRightPage();
                    this.leftBlockIterator.reset();
                    this.leftRecord = leftBlockIterator.next();
                // 右边记录全没了，重置右边，左边取下一块
                } else if (this.leftSourceIterator.hasNext()) {
                    this.rightSourceIterator.reset();
                    fetchNextLeftBlock();
                    fetchNextRightPage();
                } else {
                    // if you're here then there are no more records to fetch
                    return null;
                }
            }
        }
  ```
### 任务 2: Hash Joins
#### Simple Hash Join
* 先构建分区
* 每个分区存取一定数量的左表的值
* 取出一个分区，构建一个内存的map，这个map的key是代连接的列的值，key是该值对应的所有列
* 遍历全部右表，匹配对应行
* 然后取下一个分区
#### Grace Hash Join
* 先构建左右分区
* 将每个分区赋值
* 取左右各一个分区
* 判断左右分区哪边符合内存大小
  * 如果都不符合直接把这两个分区看成新的左右表进行递归（**有个关键点：通过hash函数，保证了左右两边代连接列相同的值在一个分区**）
  * 如果有符合内存大小的，就把这个分区取出到内存构件map，另一个遍历，得到连接结果
### 任务3：External Sort
* 几个关键词
  * pass
    * 传递数据的过程
    * pass0：conquer phase ，征服阶段，对每页排序
  * sorted runs
    * 合并页面的结果
* 需要多少缓冲页
  * Analysis of Two Way Merge
    * 一个缓冲页做pass0
    * 两页做pass1+，就是去两个sorted runs的第一页
    * 一页作为输出，pass1+的结果存到一页，这一页存完直接写入磁盘
  * Full External Sort
    * 将B页用于pass0
    * B-1页用于pass1+，多个sorted runs一起排序
    * 1页用于输出
* 大致流程
  * pass0：将每块排序然后写回磁盘（一个run）
  * 每块去其中一页，一次性可以排序B-1块
* 需要实现的方法：`SortOperator`的sortRun 、 mergeSortedRuns 、 mergePass和sort方法。
  * sortRun
    * 使用内存排序，对应pass0
  * mergeSortedRuns
    * 将传入的B-1个runs合并成1个run，对应pass1+
  * mergePass
    * 入参是所有的runs，出参是将每B-1个传递给mergeSortedRuns得到的结果的集合
  * sort
    * 最后的排序
### 任务4：Sort Merge Join
> Simple Hash Join的进阶版，就是不需要完全遍历两个循环。只有右边要回溯
> 左右分别比较，较小的推进
## 第二部分
### 任务5：Single Table Access Selection 单表查询
* 关键字
  * predicate 
* 需要实现的方法
  * QueryPlan#minCostSingleAccess
    * 目的：找到用于扫描表的最佳QueryOperator
* 完成测试： `TestSingleAccess`
### 问题和总结
* 提问：如何保证getBlockIterator，一次获取n页，这个操作是一次io的BacktrackingIterator.next 方法，目前我的理解只能是SNLJ从代码设计上是record级别的，实际上它运行的时候，不一定是每次去record都是一次磁盘io
  * 这个没看懂，getBlockIterator和SNLJ调用的都是
* 一般来说，左右表随便拆然后两两join，结果肯定是不对的，因为可能存在ta1的行和tb2的行匹配，但是hash散列之后，和ta1的待join列的值相同的行一定在tb1里
* join的各种优化都是想办法把磁盘io放一部分到内存