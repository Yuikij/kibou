## 常用命令
### 在执行的情况下进入容器
* 交互式启动容器
```shell
docker run -it my_image /bin/bash
```
* 使用 --entrypoint , 覆盖容器的默认入口点
```shell
docker run -it --entrypoint /bin/bash my_image
```

### 导出现有的容器
#### docker commit
```bash
docker commit [OPTIONS] <container_id> <new_image_name>
```
#### tips
目前的经验是commit比起export可以保留 CMD 和 ENTRYPOINT，没有进一步验证
## 运维
### 修改存储的路径
1. 修改Docker配置文件
Docker的默认存储位置通常是在 `/var/lib/docker`。要更改存储位置，你需要修改Docker的配置文件。
在 `/etc/docker/` 目录下，如果没有 `daemon.json` 文件，可以创建一个。然后编辑这个文件来指定新的存储位置：
```bash
sudo nano /etc/docker/daemon.json
```
添加或修改如下内容：
```json
{
  "data-root": "/new/docker/path"
}
```
2. 移动现有的数据（可选）

如果你希望保留现有的数据，你需要将原有的Docker数据目录移动到新位置：

```bash
sudo rsync -aP /var/lib/docker/ /new/docker/path/
```
3. 重启Docker服务

