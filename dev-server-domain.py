#!/usr/bin/env python3
"""
支持域名的开发服务器
使用方法: python3 dev-server-domain.py
"""
import http.server
import socketserver
import webbrowser
import os
import socket

PORT = 8000
DOMAIN = "pricing.local"  # 自定义域名，需要在 hosts 文件中配置

def get_local_ip():
    """获取本机局域网 IP"""
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except:
        return "127.0.0.1"

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # 添加CORS和自动刷新相关的headers
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

    def log_message(self, format, *args):
        # 自定义日志格式
        print(f"[{self.log_date_time_string()}] {format % args}")

if __name__ == "__main__":
    # 切换到脚本所在目录
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    Handler = MyHTTPRequestHandler
    
    # 尝试启动服务器，如果端口被占用则尝试其他端口
    port = PORT
    httpd = None
    max_attempts = 10
    
    for attempt in range(max_attempts):
        try:
            # 绑定到所有接口，支持域名和 IP 访问
            httpd = socketserver.TCPServer(("0.0.0.0", port), Handler)
            if port != PORT:
                print(f"⚠️  端口 {PORT} 已被占用，使用端口 {port} 代替")
            break
        except OSError as e:
            if e.errno == 48:  # Address already in use
                port += 1
                if attempt == max_attempts - 1:
                    print(f"❌ 无法找到可用端口（尝试了 {PORT}-{port}）")
                    raise
            else:
                raise
    
    with httpd:
        # 优先使用新的 index.html，如果不存在则使用旧的 pricing-dashboard.html
        if os.path.exists('index.html'):
            default_file = 'index.html'
        else:
            default_file = 'pricing-dashboard.html'
        
        local_ip = get_local_ip()
        
        urls = {
            'localhost': f"http://localhost:{port}/{default_file}",
            'domain': f"http://{DOMAIN}:{port}/{default_file}",
            'lan': f"http://{local_ip}:{port}/{default_file}"
        }
        
        print("=" * 70)
        print(f"🚀 开发服务器已启动!")
        print(f"📂 服务目录: {os.getcwd()}")
        print("=" * 70)
        print("\n🌐 访问地址:")
        print(f"   本地访问:     {urls['localhost']}")
        print(f"   域名访问:     {urls['domain']}")
        print(f"   局域网访问:   {urls['lan']}")
        print("=" * 70)
        print("\n💡 提示:")
        print(f"   - 使用域名访问需要先在 hosts 文件中添加: 127.0.0.1 {DOMAIN}")
        print("   - 修改文件后，刷新浏览器即可看到更改")
        print("   - 按 Ctrl+C 停止服务器")
        print("=" * 70)
        
        # 自动打开浏览器（使用域名）
        try:
            webbrowser.open(urls['domain'])
            print(f"\n✅ 已自动打开浏览器: {urls['domain']}\n")
        except:
            try:
                webbrowser.open(urls['localhost'])
                print(f"\n✅ 已自动打开浏览器: {urls['localhost']}\n")
            except:
                print(f"\n⚠️  无法自动打开浏览器，请手动访问上述地址\n")
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n\n🛑 服务器已停止")
