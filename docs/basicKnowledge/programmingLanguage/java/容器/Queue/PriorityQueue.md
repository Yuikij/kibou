> extends AbstractQueue<E> implements java.io.Serializable

优先级队列，通过[最小堆](/docs/algorithm/数据结构/Heap)实现

* 容器实体

```java
transient Object[] queue; // non-private to simplify nested class access
  ```

### 扩容
```java
 // Double size if small; else grow by 50%
int newCapacity = oldCapacity + ((oldCapacity < 64) ? (oldCapacity + 2) : (oldCapacity >> 1));
```


