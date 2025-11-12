#!/bin/bash

echo "🚀 CloneSnap 快速启动"
echo "===================="
echo ""
echo "🌐 启动本地服务器..."
echo "📱 请在浏览器中访问: http://localhost:8080/index-leaflet.html"
echo ""
echo "按 Ctrl+C 停止服务器"
echo ""

# 使用Python启动HTTP服务器
python3 -m http.server 8080
