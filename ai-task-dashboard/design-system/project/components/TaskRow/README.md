# TaskRow

一覧の1行。状態・経過時間・タスク名・「いま何が起きているか」の1文・担当AIと、その行で次に押すボタンを1つ並べる。

- 渡すもの：`task`（`id`・`title`・`agent`・`status`・`since`・`updatedAt` と、状態に応じて `question` / `error` / `progress` / `result`）、`expanded`、`onToggle(id, via)`、開いたときの中身 `detail`（HTMLElement）。
- 2行目の1文は状態で決まる：確認待ち＝「質問」、AI停止＝「停止理由」、作業中＝「進行」＋進捗バー、完了＝「成果」。
- 右端のボタン：確認待ち＝`primary`「回答する」、AI停止＝`secondary`「対処する」、作業中・完了＝`quiet`「詳細」。開いている間は `quiet`「閉じる」。
- タスク名は2行で切り、開くと全文。タスク名そのものも開閉ボタン（`aria-expanded`）。
- 幅600px以下では縦積み（状態と時間 → タスク名 → 1文 → AIとID → ボタン）になり、ボタンは横幅いっぱい。
- 行は `<ul class="ad-list">` に入れ、状態ごとの群（`h2`）の下に置く。
