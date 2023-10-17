# 堆(Heap)
堆是一种基于数组实现的特殊树形数据结构，它满足父节点的键值总是大于（或小于）它的子节点的键值，被称为大根堆（或小根堆）。堆经常用来实现优先队列和堆排序等算法。

* ## ADT(MinHeap)
```java
public void add(Item x);
public Item getSmallest();
public Item removeSmallest();
public int size();
```
