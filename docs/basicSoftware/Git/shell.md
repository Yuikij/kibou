---
title: Git的常用命令
---

### stash
> 临时保存工作目录的修改

### submodule
* 添加子模块
```shell
# git submodule add {仓库地址} {目录}
git submodule add https://github.com/xxx/xxx.git src/xxx
```
:::tip[使用idea的建议]
1. 在设置的Version Control - Directory Mappings中添加对应目录
2. 将不同的git Remote设置不同的别名，方便管理
:::