> extends AbstractMap<K,V> implements Map<K,V>, Cloneable, Serializable

* ## 容器实体

```java
    transient Node<K,V>[] table;
  ```
* ## 参数字段
  * ### loadFactor
    * 负载因子，默认0.75
    * 负载因子越高时间效率越低，空间效率越高
    * 表示每个桶的元素的平均数量
  * ### tableLength
    * 桶数组（表）的长度
  * ### threshold
    * 当前允许最大的容量（节点的个数）：tableLength*loadFactor
  * ### size
    * 键值对，节点个数
  * ###  modCount
    * 记录HashMap内部结构发生变化的次数