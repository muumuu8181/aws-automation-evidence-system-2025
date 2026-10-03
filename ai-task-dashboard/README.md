# AIタスク ダッシュボード（プロトタイプ）

Claude・Codex・GLM に頼んだ12件の架空タスクの状況を一目で見るための、操作できるプロトタイプとデザインシステム。通信なし・外部ライブラリなし。

- `index.html` … ブラウザで直接開ける単体版（`build.py` が生成）
- `design-system/project/` … デザインシステム（規則は `README.md`、値は `tokens.json`、部品は `components/`）
- `src/` … ダッシュボード画面のスクリプトとレイアウト

部品・トークン・画面を変えたら `python3 build.py` で `index.html` と `components/Dashboard/preview.html` を作り直す。
