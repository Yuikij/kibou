# LRU：Least Recently Used
> 一种缓存替换策略，用于在缓存已满时决定哪些数据应该被移除以腾出空间。LRU 策略的核心思想是最近最少使用的条目最有可能在未来也不会被使用，因此在需要腾出空间时优先移除这些条目。

## 工作原理
1. 维护一个记录访问顺序的数据结构：通常使用一个双向链表来实现，链表头部保存最近访问的条目，尾部保存最久未访问的条目。
2. 每次访问或插入：
   * 如果缓存中已有该数据，更新链表，将该数据移动到头部。
   * 如果是新数据，将其插入到链表头部。
3. 缓存满时：
   * 移除链表尾部的条目（即最近最少使用的条目）。

``` java
import java.util.HashMap;

class LRUCache {
    class Node {
        int key;
        int value;
        Node prev;
        Node next;
        Node(int key, int value) {
            this.key = key;
            this.value = value;
        }
    }

    private int capacity;
    private HashMap<Integer, Node> map = new HashMap<>();
    //  链表的常用手段：用虚节点，避免各种边界判断
    private Node head = new Node(0, 0);
    private Node tail = new Node(0, 0);

    public LRUCache(int capacity) {
        this.capacity = capacity;
        head.next = tail;
        tail.prev = head;
    }

    public int get(int key) {
        if (map.containsKey(key)) {
            Node node = map.get(key);
            remove(node);
            insert(node);
            return node.value;
        } else {
            return -1;
        }
    }

    public void put(int key, int value) {
        if (map.containsKey(key)) {
            Node node = map.get(key);
            remove(node);
        }
        if (map.size() == capacity) {
            map.remove(tail.prev.key);
            remove(tail.prev);
        }
        Node node = new Node(key, value);
        insert(node);
        map.put(key, node);
    }

    private void remove(Node node) {
        node.prev.next = node.next;
        node.next.prev = node.prev;
    }

    private void insert(Node node) {
        node.next = head.next;
        node.next.prev = node;
        head.next = node;
        node.prev = head;
    }
}

```