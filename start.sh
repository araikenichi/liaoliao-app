#!/bin/bash

echo "🚀 CloneSnap 地图社交应用启动器"
echo "================================"
echo ""

# 检查是否安装了http-server
if ! command -v http-server &> /dev/null; then
    echo "❌ http-server 未安装"
    echo ""
    echo "请选择安装方式："
    echo "1️⃣  使用 npm 安装 (推荐):"
    echo "   npm install -g http-server"
    echo ""
    echo "2️⃣  使用 Python 启动 (无需安装):"
    echo "   python3 -m http.server 8080"
    echo ""
    echo "3️⃣  直接打开文件 (可能有功能限制):"
    echo "   open index-leaflet.html"
    echo ""
    
    read -p "请输入选择 (1-3): " choice
    
    case $choice in
        1)
            echo "正在安装 http-server..."
            npm install -g http-server
            ;;
        2)
            echo "🌐 使用 Python 启动服务器..."
            echo "访问: http://localhost:8080/index-leaflet.html"
            python3 -m http.server 8080
            exit 0
            ;;
        3)
            echo "📱 直接打开 Leaflet 版本..."
            open index-leaflet.html
            exit 0
            ;;
        *)
            echo "❌ 无效选择"
            exit 1
            ;;
    esac
fi

echo ""
echo "🌟 选择要启动的版本："
echo "1️⃣  Leaflet版 (推荐，无需API密钥)"
echo "2️⃣  百度地图版 (需要配置API密钥)"
echo "3️⃣  同时启动两个版本"
echo ""

read -p "请输入选择 (1-3): " version_choice

case $version_choice in
    1)
        echo "🗺️  启动 Leaflet 版本..."
        echo "🌐 访问: http://localhost:8080/index-leaflet.html"
        http-server -p 8080 -o index-leaflet.html
        ;;
    2)
        echo "🗺️  启动百度地图版本..."
        echo "⚠️  请确保已在 index.html 中配置API密钥"
        echo "📖 配置说明请参考: map-config.md"
        echo "🌐 访问: http://localhost:8080/index.html"
        http-server -p 8080 -o index.html
        ;;
    3)
        echo "🚀 启动本地服务器..."
        echo "🌐 Leaflet版: http://localhost:8080/index-leaflet.html"
        echo "🌐 百度地图版: http://localhost:8080/index.html"
        echo "📱 在浏览器中手动访问对应链接"
        http-server -p 8080
        ;;
    *)
        echo "❌ 无效选择"
        exit 1
        ;;
esac 