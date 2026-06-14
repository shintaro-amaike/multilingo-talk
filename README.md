# MultiLingo Talk

> モバイル対応の多言語音声会話練習アプリケーション

## 📱 プロジェクト概要

**MultiLingo Talk** は、ユーザーがAIと自然な会話を通じて複数の言語を効率的に学習できるプラットフォームです。

### ✨ 主な特徴

- 🎤 **音声会話**: Web Speech API と Google Cloud Speech-to-Text を活用したリアルタイム音声認識
- 🤖 **AI会話**: OpenAI GPT-4 または Claude API を使用した自然な会話体験
- 🌍 **多言語対応**: 英語、日本語、中国語、韓国語、スペイン語、フランス語など
- 📊 **学習進捗分析**: 統計グラフと進捗ダッシュボード
- 📱 **モバイル最適化**: レスポンシブデザイン、PWA対応
- 🎨 **ダークモード**: 目に優しいダークテーマ
- ♿ **アクセシビリティ**: WCAG準拠

## 📸 スクリーンショット

### ホーム画面
![ホーム画面](./docs/images/home-screenshot.png)

---

## 🛠 技術スタック

### フロントエンド
| ツール | 説明 |
|--------|------|
| React 18 | UI フレームワーク |
| TypeScript | 型安全性 |
| Vite 7 | 高速ビルドツール |
| Material-UI (MUI) v5 | UIコンポーネント |
| Recharts | データ可視化 |
| Axios | HTTP通信 |
| Redux Toolkit | 状態管理 |
| React Router v6 | ルーティング |

### バックエンド
| ツール | 説明 |
|--------|------|
| FastAPI | 高性能Webフレームワーク |
| Pydantic | データバリデーション |
| SQLAlchemy | ORM |
| SQLite | データベース |
| OpenAI API / Claude API | AI会話生成 |
| Google Cloud Speech/TTS | 音声処理 |

### インフラ
| ツール | 説明 |
|--------|------|
| Docker | コンテナ化 |
| GitHub Actions | CI/CD |
| Vercel / Netlify | フロントエンド デプロイ |
| Railway / Render | バックエンド デプロイ |

---

## 🚀 クイックスタート

### 前提条件

- Node.js 18.0.0以上
- Python 3.10以上
- Git
- Docker & Docker Compose（オプション）

### 1. リポジトリクローン

```bash
git clone https://github.com/yourusername/multilingo-talk.git
cd multilingo-talk
```

### 2. フロントエンド セットアップ

```bash
cd frontend

# 依存パッケージインストール
npm install

# 環境変数設定
cp .env.example .env.local
# .env.local を編集して API URL を設定

# 開発サーバー起動
npm run dev
```

開発サーバーは [http://localhost:5173](http://localhost:5173) で起動します。

### 3. バックエンド セットアップ

```bash
cd backend

# 仮想環境作成
python -m venv venv

# 仮想環境をアクティベート
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# 依存パッケージインストール
pip install -r requirements.txt

# 環境変数設定
cp .env.example .env
# .env を編集して API キーを設定

# データベース初期化
python init_db.py

# サーバー起動
uvicorn app.main:app --reload
```

APIサーバーは [http://localhost:8000](http://localhost:8000) で起動します。

### 4. Docker Compose で起動（オプション）

**注意**: Docker Desktopがインストールされている必要があります。

```bash
# ルートディレクトリで実行
docker compose up -d

# ログ確認
docker compose logs -f
```

---

## 📁 ディレクトリ構造

```
multilingo-talk/
├── frontend/                    # React + TypeScript
│   ├── src/
│   │   ├── components/         # UIコンポーネント
│   │   ├── pages/              # ページコンポーネント
│   │   ├── hooks/              # カスタムフック
│   │   ├── services/           # API通信
│   │   ├── store/              # Redux状態管理
│   │   ├── theme/              # MUIテーマ設定
│   │   ├── types/              # TypeScript型定義
│   │   ├── context/            # React Context
│   │   └── constants/          # 定数
│   ├── public/
│   ├── e2e/                    # E2Eテスト (Playwright)
│   ├── vite.config.ts
│   ├── vitest.config.ts
│   ├── tsconfig.json
│   └── package.json
├── backend/                     # FastAPI + Python
│   ├── app/
│   │   ├── api/                # APIルート
│   │   │   └── routes/
│   │   ├── models/             # SQLAlchemyモデル
│   │   ├── schemas/            # Pydanticスキーマ
│   │   ├── services/           # ビジネスロジック
│   │   ├── core/               # 設定・セキュリティ
│   │   ├── database/           # DB接続
│   │   └── main.py             # アプリエントリポイント
│   ├── tests/                  # pytest テスト
│   ├── init_db.py              # DB初期化スクリプト
│   ├── requirements.txt
│   └── Dockerfile
├── docker-compose.yml
└── README.md                   # このファイル
```

---

## 🧪 テスト実行

### フロントエンド

```bash
cd frontend

# ユニットテスト
npm run test

# E2Eテスト
npm run test:e2e

# カバレッジ
npm run test:coverage
```

### バックエンド

```bash
cd backend

# テスト実行
pytest

# カバレッジ
pytest --cov=app tests/

# 特定のテストファイル
pytest tests/test_auth.py
```

---

## 📋 コード規約

### フロントエンド
- **言語**: TypeScript
- **フォーマッター**: Prettier
- **リンター**: ESLint
- **テスト**: Vitest + React Testing Library + Playwright (E2E)

### バックエンド
- **言語**: Python 3.10+
- **フォーマッター**: Black
- **リンター**: Flake8
- **テスト**: pytest

### Git コミットメッセージ
```
<type>(<scope>): <subject>

<body>

<footer>
```

**type**: feat, fix, docs, style, refactor, perf, test, chore
**scope**: コンポーネント・機能名
**subject**: 命令形で簡潔に

例：
```
feat(chat): add real-time translation feature

- Implement translation toggle UI
- Add language detection API
- Cache translations for performance

Closes #123
```

---

## 🔐 セキュリティ

### 環境変数管理
- `.env` ファイルは **決してリポジトリにコミットしないこと**
- `.env.example` に例示する
- API キーはプロバイダのシークレット管理システムを使用

### API セキュリティ
- CORS設定を本番環境用に調整
- レート制限実装
- 入力バリデーション（フロント・バック両側）
- HTTPS強制
- CSRF対策

---

## 🚀 デプロイ

### フロントエンド
```bash
# ビルド
npm run build

# プレビュー
npm run preview

# デプロイ (Vercel)
npm install -g vercel
vercel
```

### バックエンド
```bash
# Docker イメージビルド
docker build -t multilingo-talk-api .

# Docker コンテナ実行
docker run -p 8000:8000 multilingo-talk-api
```

詳細は各デプロイプロバイダのドキュメント参照

---

## 👥 貢献

プルリクエストやissueを通じた貢献を歓迎します。
