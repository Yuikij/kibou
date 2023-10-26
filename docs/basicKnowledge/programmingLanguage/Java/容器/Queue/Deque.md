# Deque

> extends [Queue](../Queue)\<E>

双向队列



* ## ADT
```java
void addFirst(E e);

void addLast(E e);

// *** Stack methods 堆栈方法 ***

//等同于 addFirst
void push(E e);

//等同于 removeFirst
E pop();

// *** List methods 列表方法 ***

//等同于 addLast
boolean add(E e);
...
```