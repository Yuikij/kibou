## 遇到的问题
1. 文件权限问题
服务端报错：`Authentication refused: bad ownership or modes for directory /root`
需要设置正确权限：
```shell
chmod 700 /root
```