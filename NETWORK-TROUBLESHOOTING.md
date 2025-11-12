# ネットワーク接続トラブルシューティング

## 概要

このドキュメントは、CloneSnapアプリでネットワーク接続エラーが発生した場合の解決方法を説明します。

## よくあるエラーメッセージ

### 1. "インターネット接続を確認してください"

このエラーは以下の原因で発生する可能性があります：

- 百度地図APIキーが未設定または無効
- 外部CDNリソース（Font Awesome、Google Fonts等）の読み込み失敗
- ネットワーク接続の問題
- ファイアウォールまたはプロキシの制限

## 解決方法

### 🚀 方法1：Leaflet版を使用（推奨・最速）

**APIキー不要で即座に動作します！**

```bash
# ブラウザで以下のファイルを開く
index-leaflet.html
```

✅ 利点：
- API設定不要
- すぐに使える
- 無料で制限なし

### 🔧 方法2：百度地図APIを設定

#### ステップ1：APIキーの取得

1. [百度地図開放平台](https://lbsyun.baidu.com/)にアクセス
2. アカウントを登録してログイン
3. コンソール → アプリ管理 → マイアプリ
4. 「アプリを作成」をクリック
5. 以下の情報を入力：
   - アプリ名：CloneSnap
   - アプリタイプ：ブラウザ端末
   - サービス：地図APIと位置情報APIにチェック
   - Refererホワイトリスト：開発時は `*` を設定

#### ステップ2：APIキーの設定

`index.html`ファイルを編集：

```html
<!-- 変更前 -->
<script type="text/javascript" src="https://api.map.baidu.com/api?v=3.0&ak=YOUR_BAIDU_MAP_KEY"></script>

<!-- 変更後（YOUR_BAIDU_MAP_KEYを実際のAPIキーに置き換え） -->
<script type="text/javascript" src="https://api.map.baidu.com/api?v=3.0&ak=あなたのAPIキー"></script>
```

### 🌐 方法3：ネットワーク設定の確認

#### Chromeの場合

1. **ネットワーク接続を確認**
   - Wi-Fiまたは有線接続が正常か確認
   - 他のウェブサイトが開けるか確認

2. **ファイアウォール設定**
   - システム設定 → セキュリティとプライバシー → ファイアウォール
   - Chromeがネットワークへのアクセスを許可されているか確認

3. **プロキシ設定の確認**
   - システム環境設定 → ネットワーク
   - アクティブなネットワークを選択 → 詳細設定
   - プロキシタブで不要なプロキシが選択されていないか確認

4. **ブラウザキャッシュのクリア**
   ```
   Chrome設定 → プライバシーとセキュリティ
   → 閲覧履歴データの削除
   → キャッシュされた画像とファイルを削除
   ```

### 🔍 方法4：デベロッパーツールで診断

1. Chromeでページを開く
2. `F12`キーを押してデベロッパーツールを開く
3. `Console`タブを確認：
   ```
   資源加载状态: { fontAwesome: true, googleFonts: true, baiduMaps: false }
   ```
4. `Network`タブで失敗したリクエストを確認：
   - 赤色で表示されているリクエストが失敗したリソース
   - ステータスコード `0`、`403`、`404` 等はエラーを示す

### 🛠 方法5：ローカルサーバーで実行

ファイルを直接開く代わりに、HTTPサーバーを使用：

#### Node.jsがインストールされている場合

```bash
# http-serverをインストール
npm install -g http-server

# プロジェクトディレクトリで実行
cd /path/to/liaoliao-app
http-server

# ブラウザで開く
# http://localhost:8080/index-leaflet.html
```

#### Pythonがインストールされている場合

```bash
# Python 3の場合
cd /path/to/liaoliao-app
python3 -m http.server 8080

# Python 2の場合
python -m SimpleHTTPServer 8080

# ブラウザで開く
# http://localhost:8080/index-leaflet.html
```

## エラー別対応表

| エラーメッセージ | 原因 | 解決方法 |
|--------------|------|---------|
| 地図加载失败 | 百度地図API未設定 | Leaflet版を使用 または APIキー設定 |
| Font Awesome CDN加载失败 | CDN接続失敗 | ネットワーク確認、プロキシ設定確認 |
| 資源加載失敗 | 外部リソース読み込み失敗 | ファイアウォール設定確認 |
| net::ERR_INTERNET_DISCONNECTED | インターネット未接続 | Wi-Fi/有線接続を確認 |
| net::ERR_PROXY_CONNECTION_FAILED | プロキシ設定エラー | プロキシ設定を無効化 |

## 詳細ログの確認方法

アプリはコンソールに詳細なログを出力します：

```javascript
// 成功時
✅ 資源加载状态: { fontAwesome: true, googleFonts: true, baiduMaps: true }
✅ 百度地图初始化成功

// 失敗時
❌ 百度地図API未加載 - 建議使用 index-leaflet.html
⚠️ Font Awesome加載失败 - 图标可能无法显示
```

## さらなるサポート

### 公式ドキュメント

- [百度地図API文档](https://lbsyun.baidu.com/index.php?title=jspopular3.0)
- [Leaflet Documentation](https://leafletjs.com/)
- [Chrome Network Errors](https://developer.chrome.com/docs/devtools/network/)

### ファイル構成

```
liaoliao-app/
├── index.html                    # 百度地図版（API密钥必要）
├── index-leaflet.html            # Leaflet版（推奨、即時利用可能）
├── script.js                     # 百度地図用JavaScript
├── script-leaflet.js             # Leaflet用JavaScript
├── map-config.md                 # 地図API設定詳細
├── NETWORK-TROUBLESHOOTING.md    # このファイル
└── README.md                     # プロジェクト概要
```

## クイックスタート

**最も簡単な方法：**

1. `index-leaflet.html`をブラウザで開く
2. 終わり！ 🎉

設定不要ですぐに動作します。

---

**問題が解決しない場合は、コンソールログのスクリーンショットと共にIssueを作成してください。**
