# 社員リスト管理システム

## 起動方法

```bash
# 1. 環境変数ファイルを作成
cp .env.example .env
# .env を編集して DB_PASSWORD を任意のパスワードに変更

# 2. 全コンテナを起動（初回はビルドに時間がかかります）
docker compose up -d

# 3. 動作確認
# フロントエンド: http://localhost:3000
# バックエンドAPI: http://localhost:8080/api/v1/employees

# 4. ログ確認
docker compose logs -f backend
```

## テスト実行

```bash
# バックエンド ユニットテスト
cd backend && cargo test

# フロントエンド ユニットテスト (TSVユーティリティ)
cd frontend && npm install && npm test

# E2Eテスト (docker compose up -d 起動後)
cd frontend && npx playwright install chromium && npx playwright test
```

## ディレクトリ構成

```
company_member/
├── docker-compose.yml
├── .env.example
├── backend/          # Rust / Actix-web
├── frontend/         # Next.js / TypeScript
└── Docs/
    ├── 01_要件定義/
    ├── 02_基本設計/
    ├── 03_詳細設計/
    ├── 04_テスト仕様書/
    └── 05_テスト証跡/
```
