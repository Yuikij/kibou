## 通过ssh
* 任意一台客户端生成ssh密钥
* 将公钥添加到服务器的`~/.ssh/authorized_keys`文件中
* 私钥放在github action的secrets中
* 在action脚本中拷贝私钥到~/.ssh/id_rsa
```bash
echo "${{ secrets.SSH_PRIVATE_KEY }}" > ~/.ssh/id_rsa
chmod 600 ~/.ssh/id_rsa
```
* 在action脚本中添加known_hosts
```bash
ssh-keyscan -H ${{ secrets.SERVER_HOST }} >> ~/.ssh/known_hosts
```
* 通过ssh执行远程脚本