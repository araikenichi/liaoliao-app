# 地图API配置说明

## 百度地图API配置

### 1. 获取百度地图API密钥

1. 访问 [百度地图开放平台](https://lbsyun.baidu.com/)
2. 注册账号并登录
3. 进入控制台 → 应用管理 → 我的应用
4. 点击"创建应用"
5. 填写应用信息：
   - 应用名称：CloneSnap地图社交
   - 应用类型：浏览器端
   - 启用服务：勾选"地图API"和"定位API"
   - Referer白名单：添加您的域名（开发时可设为 `*` ）

### 2. 配置API密钥

将 `index.html` 中的 `YOUR_BAIDU_MAP_KEY` 替换为您的实际API密钥：

```html
<script type="text/javascript" src="https://api.map.baidu.com/api?v=3.0&ak=您的API密钥"></script>
```

### 3. 替代方案

#### Google Maps API
如果您更偏向使用Google Maps，请：

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 启用 Maps JavaScript API
3. 创建API密钥
4. 替换脚本引用：

```html
<script src="https://maps.googleapis.com/maps/api/js?key=您的API密钥&callback=initGoogleMap"></script>
```

#### 高德地图API
对于高德地图：

1. 访问 [高德开放平台](https://lbs.amap.com/)
2. 注册并创建应用
3. 获取Web端API密钥
4. 替换脚本引用：

```html
<script type="text/javascript" src="https://webapi.amap.com/maps?v=1.4.15&key=您的API密钥"></script>
```

### 4. 免费开源方案

#### OpenStreetMap + Leaflet
无需API密钥的免费方案：

```html
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css" />
<script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
```

### 5. 本地测试

为了本地开发测试，建议：
- 使用 `http-server` 或类似工具启动本地服务器
- 避免直接双击打开HTML文件（某些API有CORS限制）

```bash
# 安装http-server (需要Node.js)
npm install -g http-server

# 在项目目录运行
http-server

# 访问 http://localhost:8080
```

### 6. 地图功能说明

当前集成的百度地图功能包括：
- ✅ 用户定位
- ✅ 地图缩放拖拽
- ✅ 自定义用户标记
- ✅ 信息窗口
- ✅ 距离计算
- ✅ 位置刷新

### 7. 注意事项

1. **API配额限制**：免费版有调用次数限制
2. **域名绑定**：生产环境需要正确配置域名白名单
3. **HTTPS要求**：某些功能需要HTTPS环境
4. **定位权限**：浏览器会请求用户授权位置信息

### 8. 故障排除

#### 地图无法加载
- 检查API密钥是否正确
- 确认网络连接正常
- 查看浏览器控制台错误信息

#### 定位失败
- 确保浏览器允许位置访问
- 检查是否在HTTPS环境下
- 尝试刷新页面重新授权

#### 标记不显示
- 检查用户数据格式是否正确
- 确认经纬度坐标有效
- 查看JavaScript控制台错误

有任何问题，请参考对应地图API的官方文档。 