# project记录
## Project 0: Setup
* 一些基本配置，没啥好说的

## Project 1: SQL
* 有一个单独的proj1的仓库
* 熟悉一些sql语句，用sqlite
* Most Common SQL Errors 最常见的 SQL 错误

  * 聚合查询中除了被聚合的列，聚合运算的列，还有其他单独的列
  
    ```sqlite
    SELECT s.sid, SUM(a.attendance) AS attend_rate, s.name
    FROM 186_students s INNER JOIN section_attendance a ON s.sid = a.sid
    GROUP BY s.sid
    ...
    ```
    > s.name 将不被识别，一行中可能有多个值，随机取一个？
  
  * HAVING 和 别名
    > 试了mysql8和sqlite3都支持
    
* 下面的任务就是编写各种查询，然后跑通test.py