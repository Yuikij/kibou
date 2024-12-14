以下是使用 Certbot 和 `certbot-dns-cloudflare` 插件，通过 DNS-01 验证获取 Let’s Encrypt 证书的详细步骤：

---

### 前置条件
1. **域名 DNS 由 Cloudflare 托管**。
2. **服务器可以联网访问 Cloudflare API**。
3. **安装 Certbot 和 `certbot-dns-cloudflare` 插件**。

---

### 步骤

#### 1. **安装 Certbot 和 Cloudflare 插件**
在大多数 Linux 发行版上可以通过包管理器安装：

**Ubuntu/Debian**：
```bash
sudo apt update
sudo apt install certbot python3-certbot-dns-cloudflare
```

**CentOS/RHEL**：
```bash
sudo yum install certbot python3-certbot-dns-cloudflare
```

如果你使用的是 Docker，可以直接运行 Certbot 的官方 Docker 镜像：
```bash
docker run -it --rm --name certbot \
    -v /etc/letsencrypt:/etc/letsencrypt \
    -v /var/lib/letsencrypt:/var/lib/letsencrypt \
    certbot/dns-cloudflare certonly
```

---

#### 2. **获取 Cloudflare API Token**
1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)。
2. 进入 **API Tokens** 页面。
3. 点击 **Create Token**。
4. 创建一个自定义 Token：
   - 权限：`Zone.DNS`，选择 **Read** 和 **Edit**。
   - 作用域：限制为你需要管理的域名。
5. 生成 Token，并记录下来。

---

#### 3. **创建 Cloudflare 配置文件**
Certbot 需要一个配置文件来存储 Cloudflare API Token。

1. 在 `/etc/letsencrypt/` 目录下创建配置文件（如果不存在则创建）：
   ```bash
   sudo mkdir -p /etc/letsencrypt
   sudo nano /etc/letsencrypt/cloudflare.ini
   ```

2. 写入以下内容：
   ```
   dns_cloudflare_api_token = YOUR_CLOUDFLARE_API_TOKEN
   ```

3. 设置配置文件权限为只读（防止 Token 泄露）：
   ```bash
   sudo chmod 600 /etc/letsencrypt/cloudflare.ini
   ```

---

#### 4. **使用 Certbot 获取证书**
运行以下命令，通过 DNS-01 验证并获取证书：

```bash
sudo certbot certonly \
    --dns-cloudflare \
    --dns-cloudflare-credentials /etc/letsencrypt/cloudflare.ini \
    -d example.com -d '*.example.com'
```

说明：
- `--dns-cloudflare`：启用 Cloudflare DNS 插件。
- `--dns-cloudflare-credentials`：指定配置文件路径。
- `-d example.com`：指定主域名。
- `-d '*.example.com'`：申请通配符证书（可选）。

成功后，证书会保存在 `/etc/letsencrypt/live/example.com/` 目录中：
- `privkey.pem`：私钥文件。
- `fullchain.pem`：完整链证书。

---

#### 5. **配置 Web 服务器**
根据你的 Web 服务器，将证书和私钥路径配置到 Nginx 或 Apache：

**Nginx 示例**：
```nginx
server {
    listen 443 ssl;
    server_name example.com;

    ssl_certificate /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;

    # 推荐的安全配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
}
```

重启 Nginx：
```bash
sudo systemctl reload nginx
```

---

#### 6. **配置自动续期**
Let’s Encrypt 的证书有效期为 90 天，建议设置自动续期。

1. 使用 Certbot 内置续期命令：
   ```bash
   sudo certbot renew --dry-run
   ```

2. 如果测试成功，Certbot 会自动添加续期任务到系统的 `cron` 或 `systemd` 中。

3. 确保在续期后自动重载 Web 服务。例如，编辑续期配置文件：
   ```bash
   sudo nano /etc/letsencrypt/renewal-hooks/post/reload-nginx.sh
   ```
   写入以下内容：
   ```bash
   #!/bin/bash
   systemctl reload nginx
   ```
   设置脚本为可执行：
   ```bash
   sudo chmod +x /etc/letsencrypt/renewal-hooks/post/reload-nginx.sh
   ```

---

### 注意事项
1. **通配符证书**：DNS-01 是申请通配符证书的唯一方法。
2. **Token 安全性**：API Token 需要妥善保管，建议限制权限和作用域。
3. **Cloudflare DNS 更新**：DNS 记录更新可能需要几分钟，请耐心等待验证通过。

通过上述步骤，Certbot 和 `certbot-dns-cloudflare` 插件可以在内网环境中为你提供有效的 SSL 证书。