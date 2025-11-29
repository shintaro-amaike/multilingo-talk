# MultiLingo Talk API 仕様書

## ベース URL

```
http://localhost:8000/api
```

## 認証

現在のフェーズではトークン認証は実装されていません。

## エンドポイント

### Health Check

#### GET /health
サーバーの稼働状態確認

**Response:**
```json
{
  "status": "ok"
}
```

---

## フェーズ1: 環境構築完了

以下のエンドポイントは **フェーズ2以降** で実装予定です。

### Conversations (フェーズ3)
- `POST /conversations/create` - 会話を作成
- `GET /conversations/{id}` - 会話を取得
- `GET /conversations` - 会話一覧を取得
- `DELETE /conversations/{id}` - 会話を削除

### Messages (フェーズ3)
- `GET /conversations/{id}/messages` - メッセージ一覧を取得
- `POST /conversations/{id}/messages` - メッセージを送信

### Speech (フェーズ2)
- `POST /speech/recognize` - 音声認識
- `POST /speech/synthesize` - 音声合成

### Feedback (フェーズ4)
- `POST /feedback/pronunciation` - 発音評価
- `POST /feedback/grammar` - 文法チェック
- `POST /vocabulary/suggestions` - 語彙提案

### Analytics (フェーズ4)
- `GET /analytics/progress` - 進捗データを取得
- `GET /analytics/statistics` - 統計データを取得

### Users (フェーズ3)
- `GET /users/profile` - プロフィール取得
- `PUT /users/profile` - プロフィール更新
- `GET /users/settings` - 設定取得
- `PUT /users/settings` - 設定更新

---

## データベーススキーマ

### users テーブル
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  username VARCHAR UNIQUE NOT NULL,
  email VARCHAR UNIQUE,
  native_language VARCHAR DEFAULT 'ja',
  learning_language VARCHAR DEFAULT 'en',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### conversations テーブル
```sql
CREATE TABLE conversations (
  id INTEGER PRIMARY KEY,
  user_id INTEGER FOREIGN KEY,
  topic VARCHAR,
  difficulty VARCHAR,
  language_pair VARCHAR,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### messages テーブル
```sql
CREATE TABLE messages (
  id INTEGER PRIMARY KEY,
  conversation_id INTEGER FOREIGN KEY,
  role VARCHAR,
  content TEXT,
  translation TEXT,
  audio_url VARCHAR,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### settings テーブル
```sql
CREATE TABLE settings (
  id INTEGER PRIMARY KEY,
  user_id INTEGER FOREIGN KEY,
  key VARCHAR,
  value VARCHAR,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## 開発サーバー起動

### 手動実行

```bash
# バックエンド
cd backend
source venv/Scripts/activate
uvicorn app.main:app --reload

# フロントエンド（別ターミナル）
cd frontend
npm run dev
```

### Docker Compose

```bash
# 開発環境
docker-compose -f docker-compose.dev.yml up

# 本番環境（イメージビルド）
docker-compose up --build
```

---

## Swagger UI

APIドキュメントは以下のURLで確認できます：

```
http://localhost:8000/docs
```

---

**最終更新**: 2025-11-29
