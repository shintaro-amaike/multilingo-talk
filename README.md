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

---

## 🛠 技術スタック

### フロントエンド
| ツール | 説明 |
|--------|------|
| React 18+ | UI フレームワーク |
| TypeScript | 型安全性 |
| Vite | 高速ビルドツール |
| Material-UI / Chakra UI | UIコンポーネント |
| Recharts | データ可視化 |
| Axios | HTTP通信 |

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
python -m alembic upgrade head

# サーバー起動
uvicorn app.main:app --reload
```

APIサーバーは [http://localhost:8000](http://localhost:8000) で起動します。

### 4. Docker Compose で起動（オプション）

```bash
# ルートディレクトリで実行
docker-compose up -d

# ログ確認
docker-compose logs -f
```

---

## 📚 ドキュメント

- [PROJECT_PLAN.md](./PROJECT_PLAN.md) - プロジェクト計画書
- [TASK_CHECKLIST.md](./TASK_CHECKLIST.md) - 詳細なタスク一覧
- [API仕様書](./backend/docs/API.md) - APIリファレンス
- [開発ガイド](./CONTRIBUTING.md) - 貢献ガイドライン

---

## 📁 ディレクトリ構造

```
multilingo-talk/
├── frontend/                    # React + TypeScript
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── store/
│   │   ├── styles/
│   │   └── types/
│   ├── public/
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── package.json
├── backend/                     # FastAPI + Python
│   ├── app/
│   │   ├── api/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── core/
│   │   └── database/
│   ├── tests/
│   ├── main.py
│   ├── requirements.txt
│   └── Dockerfile
├── docker-compose.yml
├── PROJECT_PLAN.md              # プロジェクト計画書
├── TASK_CHECKLIST.md            # タスクリスト
└── README.md                    # このファイル
```

---

## 🎯 機能一覧

### 実装済み ✅
- [ ] プロジェクト基盤構築

### 進行中 🚧
- [ ] 環境構築・基盤開発 (フェーズ1)

### 予定 📋
- [ ] 音声機能実装 (フェーズ2)
- [ ] AI会話機能実装 (フェーズ3)
- [ ] 学習支援機能 (フェーズ4)
- [ ] データ管理 (フェーズ5)
- [ ] モバイル最適化 (フェーズ6)
- [ ] テスト・デバッグ (フェーズ7)
- [ ] デプロイ・運用 (フェーズ8)

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
- **テスト**: Jest + React Testing Library

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

## 📞 サポート・フィードバック

### バグ報告
[GitHub Issues](https://github.com/yourusername/multilingo-talk/issues) から報告してください

### 質問・機能リクエスト
[GitHub Discussions](https://github.com/yourusername/multilingo-talk/discussions) でお気軽にお問い合わせください

---

## 📄 ライセンス

このプロジェクトは MIT License の下でライセンスされています。
詳細は [LICENSE](./LICENSE) を参照してください。

---

## 👥 貢献

貢献は大歓迎です！[CONTRIBUTING.md](./CONTRIBUTING.md) をご覧ください。

---

## 📊 プロジェクト進捗

| フェーズ | 説明 | 進捗 |
|---------|------|------|
| 1 | 環境構築・基盤開発 | 🚧 進行中 |
| 2 | 音声機能実装 | ⏳ 予定 |
| 3 | AI会話機能実装 | ⏳ 予定 |
| 4 | 学習支援機能 | ⏳ 予定 |
| 5 | データ管理 | ⏳ 予定 |
| 6 | モバイル最適化 | ⏳ 予定 |
| 7 | テスト・デバッグ | ⏳ 予定 |
| 8 | デプロイ・運用 | ⏳ 予定 |

---

**Last Updated**: 2025-11-29
**Maintainer**: Your Name
