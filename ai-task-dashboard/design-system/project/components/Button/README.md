# Button

操作のボタン。種類は3つで、`primary`（黒い塗り）は「あなたが押せば仕事が進む」操作だけに使う。

- 渡すもの：`label`、`variant`（`'primary' | 'secondary' | 'quiet'`、既定は secondary）、`onClick`。必要に応じて `type: 'submit'`、`disabled`、`busy` と `busyLabel`（処理中の文言）、`block`（横幅いっぱい）。
- `primary`：回答する・回答を送信・再試行。1つの行・1つの区画に1個まで。
- `secondary`：対処する・引き継ぐ・再読み込み・取り消す など、主ではないが目に見えてほしい操作。
- `quiet`：閉じる・あとで・詳細・絞り込みを解除 など、戻る／補助の操作。下線付きの文字で示す。
- 高さは `control-h`（40px）、幅600px以下で `control-h-touch`（44px）。ラベルは動詞で終える。
- 処理中は `busy: true` にして文言を「送信中…」に変える（押しても二重送信しない）。
