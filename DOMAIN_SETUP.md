# 域名访问配置指南

## 📋 目录

1. [方法一：本地 hosts 文件配置](#方法一本地-hosts-文件配置)
2. [方法二：修改开发服务器配置](#方法二修改开发服务器配置)
3. [方法三：使用内网穿透工具](#方法三使用内网穿透工具)
4. [方法四：部署到云服务器](#方法四部署到云服务器)
5. [方法五：使用本地 IP 地址](#方法五使用本地-ip-地址)

---

## 方法一：本地 hosts 文件配置

### Mac / Linux

1. **编辑 hosts 文件**
   ```bash
   sudo nano /etc/hosts
   # 或
   sudo vim /etc/hosts
   ```

2. **添加域名映射**
   ```
   127.0.0.1    pricing.local
   127.0.0.1    dashboard.local
   127.0.0.1    www.pricing.local
   ```

3. **保存并退出**
   - nano: `Ctrl+X` → `Y` → `Enter`
   - vim: `Esc` → `:wq` → `Enter`

4. **刷新 DNS 缓存**
   ```bash
   # Mac
   sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder
   
   # Linux
   sudo systemd-resolve --flush-caches
   ```

5. **启动服务器**
   ```bash
   python3 dev-server.py
   # 或
   npm run dev
   ```

6. **访问**
   - `http://pricing.local:8000`
   - `http://dashboard.local:8000`

### Windows

1. **以管理员身份打开记事本**
   - 右键点击"记事本" → "以管理员身份运行"

2. **打开 hosts 文件**
   - 文件路径：`C:\Windows\System32\drivers\etc\hosts`

3. **添加域名映射**
   ```
   127.0.0.1    pricing.local
   127.0.0.1    dashboard.local
   127.0.0.1    www.pricing.local
   ```

4. **保存文件**

5. **刷新 DNS 缓存**
   ```cmd
   ipconfig /flushdns
   ```

6. **启动服务器并访问**
   - `http://pricing.local:8000`

---

## 方法二：修改开发服务器配置

### Python 服务器配置

创建支持域名的服务器配置：

```python
# dev-server-domain.py
import http.server
import socketserver
import webbrowser
import os

PORT = 8000
DOMAIN = "pricing.local"  # 自定义域名

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

    def log_message(self, format, *args):
        print(f"[{self.log_date_time_string()}] {format % args}")

if __name__ == "__main__":
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    Handler = MyHTTPRequestHandler
    
    port = PORT
    httpd = None
    
    for attempt in range(10):
        try:
            # 绑定到所有接口，支持域名访问
            httpd = socketserver.TCPServer(("0.0.0.0", port), Handler)
            break
        except OSError as e:
            if e.errno == 48:
                port += 1
            else:
                raise
    
    with httpd:
        url = f"http://{DOMAIN}:{port}/index.html"
        print("=" * 60)
        print(f"🚀 开发服务器已启动!")
        print(f"📂 服务目录: {os.getcwd()}")
        print(f"🌐 本地访问: http://localhost:{port}/index.html")
        print(f"🌐 域名访问: {url}")
        print(f"🌐 局域网访问: http://{get_local_ip()}:{port}/index.html")
        print("=" * 60)
        
        try:
            webbrowser.open(url)
        except:
            pass
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n\n🛑 服务器已停止")
```

### Vite 配置

更新 `vite.config.js`：

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',  // 允许外部访问
    port: 8000,
    open: true,
    cors: true,
    // 如果需要 HTTPS
    // https: true
  },
  // ... 其他配置
});
```

然后访问：
- `http://pricing.local:8000`（需要配置 hosts）
- `http://你的IP:8000`（局域网访问）

---

## 方法三：使用内网穿透工具

### 使用 ngrok（推荐）

1. **安装 ngrok**
   ```bash
   # Mac
   brew install ngrok
   
   # 或下载：https://ngrok.com/download
   ```

2. **注册账号并获取 token**
   - 访问：https://dashboard.ngrok.com/get-started/your-authtoken
   - 复制 authtoken

3. **配置 ngrok**
   ```bash
   ngrok config add-authtoken YOUR_TOKEN
   ```

4. **启动本地服务器**
   ```bash
   python3 dev-server.py
   # 或
   npm run dev
   ```

5. **启动 ngrok**
   ```bash
   ngrok http 8000
   ```

6. **获取公网域名**
   ```
   Forwarding: https://xxxx-xx-xx-xx-xx.ngrok-free.app -> http://localhost:8000
   ```

7. **访问**
   - 使用 ngrok 提供的域名访问
   - 例如：`https://xxxx-xx-xx-xx-xx.ngrok-free.app`

### 使用 Cloudflare Tunnel（免费）

1. **安装 cloudflared**
   ```bash
   # Mac
   brew install cloudflared
   
   # 或下载：https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/
   ```

2. **启动隧道**
   ```bash
   cloudflared tunnel --url http://localhost:8000
   ```

3. **获取域名**
   - 会显示类似：`https://xxxx.trycloudflare.com`

### 使用 localtunnel（简单）

1. **安装**
   ```bash
   npm install -g localtunnel
   ```

2. **启动**
   ```bash
   # 先启动服务器
   python3 dev-server.py
   
   # 在另一个终端启动 tunnel
   lt --port 8000
   ```

3. **获取域名**
   - 会显示类似：`https://xxxx.loca.lt`

---

## 方法四：部署到云服务器

### 使用 Vercel（推荐，免费）

1. **安装 Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **登录**
   ```bash
   vercel login
   ```

3. **部署**
   ```bash
   # 在项目目录
   vercel
   ```

4. **获取域名**
   - Vercel 会自动分配域名
   - 例如：`https://pricing-dashboard.vercel.app`

### 使用 Netlify（免费）

1. **安装 Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **登录**
   ```bash
   netlify login
   ```

3. **初始化**
   ```bash
   netlify init
   ```

4. **部署**
   ```bash
   npm run build
   netlify deploy --prod
   ```

### 使用 GitHub Pages

1. **构建项目**
   ```bash
   npm run build
   ```

2. **创建 GitHub 仓库**

3. **配置 GitHub Pages**
   - Settings → Pages
   - Source: `dist` 目录

4. **访问**
   - `https://你的用户名.github.io/仓库名`

---

## 方法五：使用本地 IP 地址

### 获取本机 IP

**Mac / Linux:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
# 或
ip addr show | grep "inet " | grep -v 127.0.0.1
```

**Windows:**
```cmd
ipconfig
# 查找 IPv4 地址
```

### 访问方式

1. **启动服务器（绑定到所有接口）**
   ```bash
   # Python
   python3 -m http.server 8000 --bind 0.0.0.0
   
   # Vite
   # 在 vite.config.js 中设置 host: '0.0.0.0'
   npm run dev
   ```

2. **访问**
   - 本机：`http://localhost:8000`
   - 局域网：`http://192.168.x.x:8000`（使用你的实际 IP）

---

## 🔧 快速配置脚本

### Mac / Linux 快速配置脚本

创建 `setup-domain.sh`：

```bash
#!/bin/bash

DOMAIN="pricing.local"
PORT=8000

# 检查是否已存在
if grep -q "$DOMAIN" /etc/hosts; then
    echo "✅ $DOMAIN 已存在于 hosts 文件"
else
    echo "📝 添加 $DOMAIN 到 hosts 文件..."
    echo "127.0.0.1    $DOMAIN" | sudo tee -a /etc/hosts
    echo "✅ 已添加 $DOMAIN"
fi

# 刷新 DNS
echo "🔄 刷新 DNS 缓存..."
sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder

echo ""
echo "🌐 现在可以通过以下方式访问："
echo "   http://$DOMAIN:$PORT"
echo "   http://localhost:$PORT"
```

使用方法：
```bash
chmod +x setup-domain.sh
./setup-domain.sh
```

---

## 📝 推荐方案

### 开发环境
- **本地开发**: 使用 hosts 文件 + 自定义域名
- **团队协作**: 使用内网 IP 或 ngrok

### 生产环境
- **快速部署**: Vercel 或 Netlify
- **自定义域名**: 配置 DNS 指向服务器

### 演示/测试
- **临时分享**: ngrok 或 localtunnel
- **长期分享**: 部署到云服务

---

## 🔒 HTTPS 配置

### 使用 mkcert（本地 HTTPS）

1. **安装 mkcert**
   ```bash
   # Mac
   brew install mkcert
   
   # 或访问：https://github.com/FiloSottile/mkcert
   ```

2. **安装本地 CA**
   ```bash
   mkcert -install
   ```

3. **生成证书**
   ```bash
   mkcert pricing.local localhost 127.0.0.1
   ```

4. **配置服务器使用 HTTPS**
   - 更新服务器配置使用证书文件

---

## 📚 相关文档

- [Vite 服务器配置](https://vitejs.dev/config/server-options.html)
- [ngrok 文档](https://ngrok.com/docs)
- [Vercel 文档](https://vercel.com/docs)

---

**最后更新**: 2026年2月
