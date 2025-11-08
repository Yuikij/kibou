## 准备
1. 域名
2. SSL证书
3. 本地pg数据库
4. 公网服务器
5. 本地小主机(安装n8n)

## docker安装n8n

```yaml title="docker-compose.yml"
services:
  n8n:
    image: n8nio/n8n
    restart: always
    ports:
      - "5678:5678"   # Nginx 会反向代理到这个端口
    environment:
      # --- 基础配置 ---
      - NODE_ENV=production
      - N8N_HOST=your_domain.com
      - N8N_PORT=5678
      - N8N_PROTOCOL=https
      - WEBHOOK_URL=https://your_domain.com:15678/
        #- N8N_LOG_LEVEL=debug
        #- N8N_LOG_OUTPUT=console
      # --- 时区设置（中国时区） ---
      - GENERIC_TIMEZONE=Asia/Shanghai
      - TZ=Asia/Shanghai

      # --- 安全 & 运行参数 ---
      - N8N_ENFORCE_SETTINGS_FILE_PERMISSIONS=false
      - N8N_RUNNERS_ENABLED=false
      - NODE_TLS_REJECT_UNAUTHORIZED=0
      - N8N_SECURE_COOKIE=false
      # --- 数据库配置（外部 MySQL） ---
      - DB_TYPE=postgresdb
      - DB_POSTGRESDB_HOST=xxx
      - DB_POSTGRESDB_PORT=5432
      - DB_POSTGRESDB_DATABASE=n8n
      - DB_POSTGRESDB_USER=postgres
      - DB_POSTGRESDB_PASSWORD=your_password

      # --- 管理员登录（可选） ---
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=your_username
      - N8N_BASIC_AUTH_PASSWORD=your_password

      # --- 代理 ---
      - HTTP_PROXY=http://your_proxy_ip:7890
      - HTTPS_PROXY=http://your_proxy_ip:7890
      - NO_PROXY=localhost,127.0.0.1,your_proxy_ip

    volumes:
      - ./n8n_data:/home/node/.n8n
      - ./local-files:/files
      - ./data:/home/node/data
```
## 公网服务器配置
* 内网穿透，可以用frp或者zerotier
* 配置nginx和证书
  
```conf title="nginx.conf"
server {
    listen 15678 ssl http2;
    ssl_certificate /xxx/fullchain.pem;
    ssl_certificate_key /xxx/privkey.pem;
    server_name your_domain.com;

    location / {
        proxy_pass http://your_proxy_ip:5678;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade"; 
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Host $http_host;
        proxy_set_header Connection upgrade;
        proxy_set_header Accept-Encoding gzip;
        proxy_buffer_size 32k;
        proxy_buffers 8 64k;
        proxy_busy_buffers_size 128k;

        proxy_read_timeout 600s;
        proxy_send_timeout 600s;
        proxy_connect_timeout 60s;
        # Add CORS headers
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
        add_header Access-Control-Allow-Headers "*";

        tcp_nodelay on;
        tcp_nopush on;

        gzip on;
        gzip_types text/plain text/css application/json application/x-javascript text/xml application/xml application/xml+rss text/javascript application/javascript;
        gzip_comp_level 6;
        gzip_min_length 1000;
        gzip_proxied any;
    }
}
```