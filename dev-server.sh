#!/bin/bash
# 简单的开发服务器脚本
# 使用方法: ./dev-server.sh 或 bash dev-server.sh

PORT=8000
FILE="pricing-dashboard.html"

echo "============================================================"
echo "🚀 启动开发服务器..."
echo "============================================================"

# 检查Python是否可用
if command -v python3 &> /dev/null; then
    python3 -m http.server $PORT
elif command -v python &> /dev/null; then
    python -m http.server $PORT
else
    echo "❌ 错误: 未找到 Python，请安装 Python 3"
    exit 1
fi
