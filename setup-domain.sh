#!/bin/bash

# 域名配置脚本
# 使用方法: ./setup-domain.sh

DOMAIN="pricing.local"
PORT=8000

echo "🔧 配置域名访问..."
echo ""

# 检查是否已存在
if grep -q "$DOMAIN" /etc/hosts 2>/dev/null; then
    echo "✅ $DOMAIN 已存在于 hosts 文件"
else
    echo "📝 添加 $DOMAIN 到 hosts 文件..."
    echo "127.0.0.1    $DOMAIN" | sudo tee -a /etc/hosts > /dev/null
    if [ $? -eq 0 ]; then
        echo "✅ 已添加 $DOMAIN"
    else
        echo "❌ 添加失败，请手动编辑 /etc/hosts 文件"
        exit 1
    fi
fi

# 刷新 DNS 缓存
echo "🔄 刷新 DNS 缓存..."
if [[ "$OSTYPE" == "darwin"* ]]; then
    # Mac
    sudo dscacheutil -flushcache 2>/dev/null
    sudo killall -HUP mDNSResponder 2>/dev/null
    echo "✅ DNS 缓存已刷新"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    sudo systemd-resolve --flush-caches 2>/dev/null || sudo service network-manager restart 2>/dev/null
    echo "✅ DNS 缓存已刷新"
else
    echo "⚠️  请手动刷新 DNS 缓存"
fi

echo ""
echo "=" * 60
echo "✅ 配置完成！"
echo "=" * 60
echo ""
echo "🌐 现在可以通过以下方式访问："
echo "   http://$DOMAIN:$PORT"
echo "   http://localhost:$PORT"
echo ""
echo "💡 启动服务器："
echo "   python3 dev-server-domain.py"
echo "   或"
echo "   npm run dev"
echo ""
