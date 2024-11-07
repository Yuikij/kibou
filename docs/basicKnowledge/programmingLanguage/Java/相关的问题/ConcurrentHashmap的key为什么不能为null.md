## 初步猜想
首先是不能为null，源码就是这么写的，而且在实践中需要注意，把HashMap替换成ConcurrentHashMap后，如何kv存在null，就直接抛出异常了。    
至于为什么不能，我的猜想是作者可能把null当成特殊值做了一些判断，但是目前没找到。
## 继续查找资料
后来得知作者Doug Lea和HashMap的作者Josh Bloch因为这事还争论过，于是去找相关文章。原链接已经不能访问了，这边找到了[存档](https://github.com/kabutz/concurrency-interest-archive/blame/master/archive/2006-05.txt#L2630)，内容如下：
```
这位老哥Tutika讲了他从 HashMap 替换为 ConcurrentHashMap 时候的问题，他在HashMap允许了null的存在，
但是ConcurrentHashMap不允许null，于是他想包装一层ConcurrentHashMap，来转化kv的null，但是keySet()、
values()这些批量方法很难操作。
__________________________________________________
Hi ,
I would like to replace some Hashmaps in our
application, which are prone to multi threading issues
with ConCurrentHashMap.

Currently we keep null key and values in hashmap
without any issues as HashMap allows them.

But ConcurrentHashMap does not allow any null key and
values .

I would like to know whether anybody is following any
general practice to tackle this issue .

It is very difficult to check for null keys and values
in my entire application .


I thought of writing a wrapper around
ConcurrentHashMap which will mask and unmask key and
values with some other object, when null values are
getting inserted .

But the issue is that in certain bulk operations like
keySet() , values() etc, it is very difficult unmask
them.

If anybody has ideas in resolving this kind of issue,
Please let me know.
It would be helpful to us .

Tutika
```
* 然后一位叫Holger的热情的回答了Tutika，大概的意思是：
  * 你的并发问题不应该仅仅引入ConcurrentHashMap去解决（没懂）
  * 你应该避免null的情况，就算是HashMap也不应该存放null
  * 可以用切面去捕获null，抛出异常或者替换默认值
<details>
<summary>内容有点多，直接复制下来</summary>

```mail

Tutika Chakravarthy wrote:
> I would like to replace some Hashmaps in our
> application, which are prone to multi threading issues
> with ConCurrentHashMap.

You must understand upfront that this may or may not give you the desired
results, though it will 'likely' 'work' in your case. The
ConcurrentModificationExceptions that you probably see are just a symptom
of a deeper root cause; it is a good idea to fix that instead of taping up
the symptom, simply because it is very likely that you will simply see
other concurrency bugs after this visible problem has been 'fixed'.

The problem with concurrency is not the bugs that you see (like CME); be
thankful for those.

> Currently we keep null key and values in hashmap
> without any issues as HashMap allows them.

Yes, this is a terrible error in the Java Map classes.

> But ConcurrentHashMap does not allow any null key and
> values .
> I would like to know whether anybody is following any
> general practice to tackle this issue .

Make it caller's policy to check for both key and value to be not null.
Include tests for this policy in your unit tests (if you have any).

> It is very difficult to check for null keys and values
> in my entire application .

This is just the price to pay for using the broken HashMap behaviour in
the first place. The "standard" Java libraries are full of these hidden
long-term cost factors. :-(

> I thought of writing a wrapper around
> ConcurrentHashMap which will mask and unmask key and
> values with some other object, when null values are
> getting inserted .
> 
> But the issue is that in certain bulk operations like
> keySet() , values() etc, it is very difficult unmask
> them.

Right. Even then you'd still have the problem that you need to find all
callers of the existing Map constructors and fix them up; this may or may
not be possible, e.g. if you get the Map from somewhere else.

> If anybody has ideas in resolving this kind of issue,
> Please let me know.

You have several options.

1) accept that you have a concurrency problem and fix the root cause, not
just the symptoms by trying to "fix" the Map behaviour; it is just an
indicator that something else is wrong. This may mean a full, partial or
subsystem-limited concurrency analysis of either the whole application or
the affected subsystem (if there are any). This also means that you have
to come up with a stringent definition of what it means for your
application (or the relevant part) to be concurrent. This will expose the
critical sections that you can then address, _for example_ by simply using
a Collections.synchronizedMap() around the original, or by using a
ConcurrentHashMap.

1) invert the above approach and 'invade' all offending code parts with
AOP; this would enable you to fix existing JARs as well. I have attached a
simple AspectJ MapCheck aspect with example that you can weave into your
application. Currently this will throw IllegalArgumentExceptions, but of
course you could modify this by skipping the put operation or using
default values. Please think VERY hard whether this works for your case,
because you may end up replacing values with the default key because a
caller erroneously passed a null key, or vice versa. The existing aspect
was meant to expose the null key/value problems as early as possible.
Skipping the operation may or may not be a viable option in your case.

There is no easy solution/quick fix to your problem.

Holger
-------------- next part --------------

package mapcheck;

import java.util.Map;

public aspect MapNullCheck
{

	pointcut methodsToCheck(Object key, Object value):
	    call(public Object Map.put(Object, Object))
	    && args(key, value)
	    && within(MapAccess);

	Object around(Object key, Object value): methodsToCheck(key, value)
	{
		if (key != null)
		{
			if (value != null)
			{
				return proceed(key, value);
			}
			else
			{
				throw new IllegalArgumentException("no null values!");
			}
		}
		else
		{
			throw new IllegalArgumentException("no null keys!");
		}
	}

}
-------------- next part --------------

package mapcheck;

import java.util.HashMap;
import java.util.Map;

import org.apache.log4j.Logger;

public class MapAccess
{
    private static Logger log = Logger.getLogger(MapAccess.class);

    public static void main(String[] args)
    {
        Map<String, String> m = new HashMap<String, String>();
        m.put("foo", "bar");
        m.put("keyForNullValue", null);
        m.put(null, "valueForNullKey");
        log.info("map with nulls: " + m);
    }

}

```
</details>

### 作者 Doug Lea 大佬入场

> Doug Lea 强调了`map.get(key)`返回的null，没法判断这个null是明确的值还是这个key没有被映射，这个问题在HashMap中，可以通过`contains(key)`来检查，但是在并发环境中，`contains(key)`是线程不安全的，返回值不确定。
> Doug Lea 讲了个题外话：他认为在map里引入null容易产生错误。在非线程安全的map或者set中是否允许null也是他和Josh Bloch长期存在分歧的问题。
> Doug Lea给出了建议：static final Object NULL = new Object()。用特殊值取代null。

```
Tutika Chakravarthy wrote:
> Hi ,
> I would like to replace some Hashmaps in our
> application, which are prone to multi threading issues
> with ConCurrentHashMap.
> 
> Currently we keep null key and values in hashmap
> without any issues as HashMap allows them.
> 
> But ConcurrentHashMap does not allow any null key and
> values .
> 

Try to take Holger's advice. As mostly an aside though...

The main reason that nulls aren't allowed in ConcurrentMaps
(ConcurrentHashMaps, ConcurrentSkipListMaps) is that
ambiguities that may be just barely tolerable in non-concurrent
maps can't be accommodated. The main one is that if
map.get(key) returns null, you can't detect whether the
key explicitly maps to null vs the key isn't mapped.
In a non-concurrent map, you can check this via map.contains(key),
but in a concurrent one, the map might have changed between calls.

Further digressing: I personally think that allowing
nulls in Maps (also Sets) is an open invitation for programs
to contain errors that remain undetected until
they break at just the wrong time. (Whether to allow nulls even
in non-concurrent Maps/Sets is one of the few design issues surrounding
Collections that Josh Bloch and I have long disagreed about.)

> 
> It is very difficult to check for null keys and values
> in my entire application .
> 

Would it be easier to declare somewhere
   static final Object NULL = new Object();
and replace all use of nulls in uses of maps with NULL?

-Doug
```

### Joshua Bloch
> Joshua Bloch随后也进行了回复，他也认为null可能会带来麻烦。显然Doug比他更讨厌null。
```

Doug,

On 5/12/06, Doug Lea <dl@cs.oswego.edu> wrote:

> Further digressing: I personally think that allowing
> nulls in Maps (also Sets) is an open invitation for programs
> to contain errors that remain undetected until
> they break at just the wrong time. (Whether to allow nulls even
> in non-concurrent Maps/Sets is one of the few design issues surrounding
> Collections that Josh Bloch and I have long disagreed about.)

I have moved towards your position over the years.  It was probably a
mistake to allow null keys in Maps and null elements in Sets.  I'm
still not sure about Map values and List elements.

In other words, Doug hates null more than I do, but over the years
I've come to see it as quite troublesome.

       Josh
```

## 总结下来
* value不能是null是可以理解的
* key为什么不能是null暂时不明白