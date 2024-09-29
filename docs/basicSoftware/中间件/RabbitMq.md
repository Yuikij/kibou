# RabbitMQ

## 交换机
### 从Exchange到Queue的几种方式
* Direct Exchange：直连交换机是 RabbitMQ 的默认交换机，也是最简单的一种交换机。它将消息路由到那些绑定键与消息的路由键完全匹配的队列中。
* Fanout Exchange：扇形交换机会将收到的所有消息都转发到与之绑定的所有队列中，它不关心消息的路由键。
* Topic Exchange：主题交换机可以根据路由键的模式将消息路由到多个队列中。路由键的模式可以使用通配符 * 和 #，其中 * 匹配单个单词，# 匹配任意数量的单词。
* Headers Exchange：
  * 头交换机使用消息头中的键值对来匹配队列，而不是路由键。如果消息头中的键值对与队列的绑定参数完全匹配，则消息将被路由到该队列中。
    ```java
        // 设置消息头
    Map<String, Object> headers = new HashMap<>();
    headers.put("x-match", "all");
    headers.put("type", "book");
    headers.put("format", "pdf");
    // 发布消息，消费者需要匹配 type，format，如果x-match为any，则1匹配一个即可
    String message = "This is a PDF book.";
    channel.basicPublish(EXCHANGE_NAME, "", null, message.getBytes("UTF-8"), headers);
    ```

### 备用交换机
> 备用交换机，当消息发送到当前交换机失败时，会转发到备用交换机
```java
    @Bean
    public Exchange exchange(){
        return ExchangeBuilder.topicExchange(exchange).durable(true)
                .withArgument("alternate-exchange", ALTERNATE_EXCHANGE)  // 设置备用交换器
                .build();
    }
```

### 交换机到交换机的绑定
> 先发到绑定的交换机，再发到交换机，和绑定队列类似，会消费两遍
```java
    // 定义交换机到交换机的绑定
    @Bean
    public Binding exchangeToExchangeBinding() {
        // 绑定 sourceExchange 到 destinationExchange，使用 routingKey "my.routing.key"
        return BindingBuilder.bind(secondExchange())
                .to(exchange())
                .with(routingKey)
                .noargs();
    }
```
## 队列
## 消息
### 消息属性

### 消息回复的状态

| 状态 | 描述 |
| --- | --- |
| Ready | 消息已经准备 |
| Unacked | 消息还没有被确认 |
| Acked | 消息已经被确认 |
| Rejected | 消息已经被拒绝 |

> * 在 Spring AMQP 中，默认的处理方式为自动，区别于 RabbitMQ的autoAck，监听的方法正常返回，则发送ack，抛出异常则发送nack
> * 拒绝或者之后，可以通过requeue控制是否丢弃，丢弃就会进入死信队列，如果有的话，否则就重新排队

## Q&A
* 消息发送之后，监控面板的Message rates 一直有波动，但是 Queued messages没有变化
 > 如果消费速度太快的话，可能不会进入Queued messages的统计