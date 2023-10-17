# Queue

> extends Collection\<E>

* ## ADT

```java

/**
 * 不受容量限制的add，添加失败返回false不抛出异常
 */
boolean offer(E e);

E remove();

/**
 * 队列为空返回false
 */
E poll(); 

E element();

E peek();
```


|    | 抛出异常      | 返回布尔值    | 阻塞     | 可以等待                    |
|----|-----------|----------|--------|-------------------------|
| 入队 | add(e)    | offer(e) | put()  | offer(e, timeout, unit) |
| 出队 | remove()  | poll()	  | take() | poll(timeout, unit)     |
| 查看 | element() | peek()   | 无      | 无                       |

