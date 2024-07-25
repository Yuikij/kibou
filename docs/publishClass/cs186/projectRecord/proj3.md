## Project 3
### 框架代码
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
#### query/disk
#### Scan and Special Operators
#### query/QueryPlan.java
#### Task1:
##### 理解QueryOperator
##### 理解Simple Nested Loop Join
* 重要的就是实现迭代器，嵌套的两个for循环
##### Block Nested Loop Join
* 需要实现的方法：
  * fetchNextLeftBlock
  * fetchNextRightPage
  * fetchNextRecord
#### Task 2: Hash Joins
##### Simple Hash Join
##### Grace Hash Join
### 问题和总结
##### Block Nested Loop Join
* 如何保证getBlockIterator，一次获取n页，这个操作是一次io的，没看懂