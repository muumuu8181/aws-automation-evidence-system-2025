# Notice

画面や行の中に出すお知らせ。読み込みエラー、送信の成功、補足情報の3種類。

- 渡すもの：`tone`（`'error' | 'success' | 'info'`）、`title`、`body`、`actions`（`Button` の props の配列）。`focusable: true` にすると操作直後にフォーカスを移せる。
- `error`：`stop-soft` の地・`stop-text` の枠・! の印。`role="alert"`。本文は「何が起きたか（コード）→ 表示中の内容はいつ時点か → 次の行動」の順。ボタンは `secondary`「再読み込み」。
- `success`：`surface` の地・✓ の印。操作した行の中に出し、「取り消す」（secondary）と「閉じる」（quiet）を置く。
- `info`：`surface-muted` の地・i の印。
- トースト（画面の端に浮かんで消える通知）にはしない。結果は操作した場所に残す。
