> extends AbstractCollection<E> implements Deque<E>, Cloneable, Serializable

循环数组实现的双向队列

* 容器实体

```java
transient Object[] elements; // non-private to simplify nested class access

transient int head;

transient int tail;
  ```