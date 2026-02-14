#!/usr/bin/env python3
"""
简单的开发服务器，支持自动刷新
使用方法: python3 dev-server.py
"""
import http.server
import socketserver
import webbrowser
import os
from pathlib import Path

PORT = 8000

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
            httpd = socketserver.TCPServer(("", port), Handler)
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
        # 优先使用模块化版本，然后是标准版本，最后是旧版本
        import os
        if os.path.exists('index.modular.html'):
            url = f"http://localhost:{port}/index.modular.html"
        elif os.path.exists('index.html'):
            url = f"http://localhost:{port}/index.html"
        else:
            url = f"http://localhost:{port}/pricing-dashboard.html"
        print("=" * 60)
        print(f"🚀 开发服务器已启动!")
        print(f"📂 服务目录: {os.getcwd()}")
        print(f"🌐 访问地址: {url}")
        print("=" * 60)
        print("\n💡 提示:")
        print("   - 修改 pricing-dashboard.html 文件后，刷新浏览器即可看到更改")
        print("   - 按 Ctrl+C 停止服务器")
        print("=" * 60)
        
        # 自动打开浏览器
        try:
            webbrowser.open(url)
            print(f"\n✅ 已自动打开浏览器: {url}\n")
        except:
            print(f"\n⚠️  无法自动打开浏览器，请手动访问: {url}\n")
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n\n🛑 服务器已停止")
