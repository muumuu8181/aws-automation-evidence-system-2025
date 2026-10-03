/* AIタスク ダッシュボード — 操作できるプロトタイプ。データはすべて架空、通信なし。
   window.AIDash（components/bundle.js）の部品だけで画面を組み立てる。 */
(function () {
  'use strict';
  var D = window.AIDash, h = D.h;
  var MIN = 60000;
  var SEND_DELAY = 700;

  /* ---------- 架空データ（12件：確認待ち3・AI停止2・作業中4・完了3） ---------- */
  function seed(now) {
    var ago = function (m) { return now - m * MIN; };
    return [
      { id: 'T-101', agent: 'claude', status: 'wait', title: '請求書PDFの自動仕分けスクリプト作成', createdAt: ago(190), since: ago(42), updatedAt: ago(42),
        question: { text: '取引先名を読み取れないPDFが3件あります。どう扱いますか？', context: 'スキャン画質が低い8月分の請求書です。残り39件は仕分け済みで、この3件の扱いが決まるまで止めています。',
          options: [{ id: 'a', label: '「未分類」フォルダに移して先へ進む', hint: '推奨。あとでまとめて確認できます' }, { id: 'b', label: 'ファイル名から取引先を推測する', hint: '誤って仕分ける可能性があります' }, { id: 'c', label: '処理を止めて一覧だけ出す', hint: '3件は手作業で仕分けます' }] },
        steps: ['仕様確認', '雛形作成', '仕分け処理', '例外の扱い', '動作確認'], progress: { done: 3, total: 5, current: '例外の扱いを確認待ち' }, resume: '回答に沿って残り3件を処理中',
        log: [{ at: ago(190), who: 'you', text: '依頼：受信フォルダの請求書PDFを取引先ごとに仕分けるスクリプトを作成' }, { at: ago(120), who: 'claude', text: '42件中39件を仕分け' }, { at: ago(42), who: 'claude', text: '取引先名を読み取れないPDFが3件。確認を依頼' }] },
      { id: 'T-102', agent: 'codex', status: 'wait', title: 'ログイン画面のバリデーション修正', createdAt: ago(95), since: ago(18), updatedAt: ago(18),
        question: { text: 'パスワードの最小文字数を8文字から12文字に変えると、既存のテストが6件失敗します。テストも合わせて更新してよいですか？', context: '失敗するのは「8〜11文字のパスワードで登録できる」ことを確かめるテストです（tests/auth/ 内）。',
          options: [{ id: 'a', label: 'テストも12文字に合わせて更新する', hint: '推奨。変更は tests/auth/ の6件' }, { id: 'b', label: '最小文字数は8文字のまま据え置く', hint: 'ほかのバリデーション修正だけ行います' }] },
        steps: ['原因調査', '修正', 'テスト更新', 'レビュー用PR作成'], progress: { done: 2, total: 4, current: 'テスト更新の方針を確認待ち' }, resume: '回答に沿ってテストを更新中',
        log: [{ at: ago(95), who: 'you', text: '依頼：ログイン画面で弱いパスワードが通る問題を修正' }, { at: ago(40), who: 'codex', text: '原因を特定し、最小文字数のチェックを修正' }, { at: ago(18), who: 'codex', text: '既存テスト6件との食い違いを確認。方針を質問' }] },
      { id: 'T-103', agent: 'glm', status: 'wait', title: '週次レポートの英訳（取引先向け）', createdAt: ago(60), since: ago(5), updatedAt: ago(5),
        question: { text: '「工数」の訳語をどれに統一しますか？', context: '原文に「工数」が14回出てきます。今は訳語が混在しているため、1つに揃えます。',
          options: [{ id: 'a', label: 'person-hours', hint: '推奨。性別に中立な表現' }, { id: 'b', label: 'man-hours', hint: '従来よく使われる表現' }, { id: 'c', label: 'effort', hint: '数値を伴わない箇所向き' }] },
        steps: ['下訳', '用語の統一', '最終確認'], progress: { done: 1, total: 3, current: '用語の統一を確認待ち' }, resume: '訳語を統一して最終確認中',
        log: [{ at: ago(60), who: 'you', text: '依頼：週次レポート（10/3版）を取引先向けに英訳' }, { at: ago(5), who: 'glm', text: '下訳が完了。訳語の統一について質問' }] },
      { id: 'T-104', agent: 'codex', status: 'stop', title: '顧客データ移行スクリプトのリファクタリングと、旧フォーマット（2019年版CSV・Shift_JIS・列順不定）から新スキーマへの変換テスト追加 — migrate_legacy_customer_records_v2.py の分割と型付けを含む', createdAt: ago(240), since: ago(26), updatedAt: ago(26),
        error: { message: 'テストの実行環境がタイムアウトしました（30分の上限）。', code: 'E-TIMEOUT-30M', detail: '変換テスト48件中31件目（約12万行のCSV）で応答が止まりました。Codex 側の実行環境の制限によるものです。', hint: '再試行すると31件目から再開します。' },
        steps: ['現状把握', 'リファクタリング', '変換テスト作成', '変換テスト実行', 'PR作成'], progress: { done: 3, total: 5, current: '変換テストの実行が停止' }, resume: '変換テストの残り17件を実行中',
        log: [{ at: ago(240), who: 'you', text: '依頼：移行スクリプトの整理と変換テストの追加' }, { at: ago(90), who: 'codex', text: 'リファクタリング完了。変換テスト48件を作成' }, { at: ago(26), who: 'codex', text: 'テスト実行中にタイムアウトして停止' }] },
      { id: 'T-105', agent: 'glm', status: 'stop', title: '競合サービス3社の料金ページ要約', createdAt: ago(50), since: ago(11), updatedAt: ago(11),
        error: { message: 'AIの利用上限に達しました。', code: '429 Too Many Requests', detail: 'GLM の利用枠を使い切りました。約30分後に回復する見込みです。', hint: '今すぐ進めたい場合は、別のAIに引き継げます。' },
        steps: ['1社目', '2社目', '3社目と比較表'], progress: { done: 1, total: 3, current: '2社目の要約で停止' }, resume: '2社目の料金ページを要約中',
        log: [{ at: ago(50), who: 'you', text: '依頼：競合3社の料金プランを1枚に要約' }, { at: ago(30), who: 'glm', text: '1社目の要約が完了' }, { at: ago(11), who: 'glm', text: '利用上限に達して停止' }] },
      { id: 'T-106', agent: 'claude', status: 'run', title: 'ブログ記事「個人開発の1年を振り返る」の下書き', createdAt: ago(70), updatedAt: ago(3),
        steps: ['構成案', '第1章', '第2章', '第3章', '推敲'], progress: { done: 3, total: 5, current: '第3章「失敗したこと」を執筆中' },
        log: [{ at: ago(70), who: 'you', text: '依頼：振り返り記事の下書き（4000字程度）' }, { at: ago(30), who: 'claude', text: '第2章まで完了' }, { at: ago(3), who: 'claude', text: '第3章を執筆中' }] },
      { id: 'T-107', agent: 'codex', status: 'run', title: '家計簿アプリにCSV取り込み機能を追加', createdAt: ago(130), updatedAt: ago(7),
        steps: ['仕様確認', 'パーサ実装', 'テスト作成', '画面', 'エラー処理', '動作確認'], progress: { done: 2, total: 6, current: '銀行3社のCSV形式に対応するテストを作成中' },
        log: [{ at: ago(130), who: 'you', text: '依頼：銀行のCSV明細を取り込めるようにする' }, { at: ago(45), who: 'codex', text: 'パーサを実装' }, { at: ago(7), who: 'codex', text: 'テスト作成中' }] },
      { id: 'T-108', agent: 'glm', status: 'run', title: '10/2 定例ミーティング議事録の要点整理', createdAt: ago(20), updatedAt: ago(1),
        steps: ['文字起こしの整形', '要点の抽出', '共有用に整形'], progress: { done: 1, total: 3, current: '決定事項と宿題を抽出中' },
        log: [{ at: ago(20), who: 'you', text: '依頼：議事録から決定事項と宿題を抜き出す' }, { at: ago(1), who: 'glm', text: '要点を抽出中' }] },
      { id: 'T-109', agent: 'claude', status: 'run', title: '旅行プランの比較表（京都・金沢 2泊3日）', createdAt: ago(55), updatedAt: ago(14),
        steps: ['候補の洗い出し', '宿の比較', '移動手段', '予算表', '仕上げ'], progress: { done: 4, total: 5, current: '移動時間と予算の表を仕上げ中' },
        log: [{ at: ago(55), who: 'you', text: '依頼：11月の旅行候補を比較' }, { at: ago(14), who: 'claude', text: '予算表まで完了' }] },
      { id: 'T-110', agent: 'codex', status: 'done', title: '依存パッケージの更新（npm audit の警告対応）', createdAt: ago(160), updatedAt: ago(35),
        result: { summary: '警告12件をすべて解消し、テスト214件が成功しました。', files: ['package.json', 'package-lock.json', 'CHANGELOG.md'] },
        log: [{ at: ago(160), who: 'you', text: '依頼：npm audit の警告を解消' }, { at: ago(35), who: 'codex', text: '完了。テスト214件が成功' }] },
      { id: 'T-111', agent: 'claude', status: 'done', title: 'メール返信の下書き5件', createdAt: ago(110), updatedAt: ago(80),
        result: { summary: '5件の下書きを作成しました。うち2件は日程の確認が必要です。', files: ['返信下書き_1003.md'] },
        log: [{ at: ago(110), who: 'you', text: '依頼：未返信メール5件の下書き' }, { at: ago(80), who: 'claude', text: '完了' }] },
      { id: 'T-112', agent: 'glm', status: 'done', title: '論文要約：小規模言語モデルの評価手法', createdAt: ago(300), updatedAt: ago(150),
        result: { summary: 'A4 1枚の要約と、評価指標の比較表を作成しました。', files: ['summary_small-lm-eval.md', 'metrics_table.csv'] },
        log: [{ at: ago(300), who: 'you', text: '依頼：論文1本の要約と指標の整理' }, { at: ago(150), who: 'glm', text: '完了' }] }
    ];
  }

  /* ---------- 状態 ---------- */
  var state;
  function initialState() {
    var now = Date.now();
    return {
      tasks: seed(now), dataMode: 'normal', loadError: false, loading: false, failSend: false, lastSync: now,
      filter: { status: null, agent: null, q: '' },
      openId: null, drafts: {}, errors: {}, busyId: null, hold: null, flash: {}, reassign: {}, focusKey: null
    };
  }
  state = initialState();

  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function find(id) { for (var i = 0; i < state.tasks.length; i++) if (state.tasks[i].id === id) return state.tasks[i]; return null; }
  function agentName(k) { return (D.AGENTS[k] || { name: k }).name; }
  function countBy(status) { return state.tasks.filter(function (t) { return t.status === status; }).length; }
  function groupOf(t) { return state.hold && state.hold.id === t.id ? state.hold.group : t.status; }
  function filterActive() { var f = state.filter; return !!(f.status || f.agent || f.q.trim()); }
  function matches(t) {
    var f = state.filter;
    if (f.status && groupOf(t) !== f.status) return false;
    if (f.agent && t.agent !== f.agent) return false;
    var q = f.q.trim().toLowerCase();
    if (q) {
      var hay = [t.title, t.id, agentName(t.agent), t.question && t.question.text, t.error && t.error.message, t.result && t.result.summary, t.progress && t.progress.current].join(' ').toLowerCase();
      if (hay.indexOf(q) < 0) return false;
    }
    return true;
  }
  function sortGroup(list, g) {
    return list.slice().sort(function (a, b) {
      if (g === 'wait' || g === 'stop') return (a.since || 0) - (b.since || 0); // 長く止まっているものを上に
      return b.updatedAt - a.updatedAt; // 新しく動いたものを上に
    });
  }
  function oldest(status) { return sortGroup(state.tasks.filter(function (t) { return t.status === status; }), status)[0] || null; }

  /* ---------- 骨組み（一度だけ作る） ---------- */
  var root = document.getElementById('ad-root');
  var els = {};
  function build() {
    root.textContent = '';
    els.live = h('div', { class: 'ad-sr', 'aria-live': 'polite', role: 'status' });
    els.sub = h('p', { class: 'ad-head__sub t-meta ad-num' });
    els.refresh = h('div', { class: 'ad-head__actions' });
    els.notices = h('div', { class: 'ad-notices' });
    els.overview = h('section', { class: 'ad-overview', 'aria-labelledby': 'ov-title' });
    els.agents = h('div', { class: 'ad-filters__agents', role: 'group', 'aria-labelledby': 'agent-label' });
    els.search = h('input', { id: 'ad-q', type: 'search', class: 'ad-input t-body', placeholder: 'タスク名・質問・エラー内容で検索', autocomplete: 'off',
      onInput: function (e) { state.filter.q = e.target.value; releaseHold(); renderList(); renderResult(); } });
    els.result = h('div', { class: 'ad-result t-meta', 'aria-live': 'polite' });
    els.groups = h('div', { class: 'ad-groups' });

    root.appendChild(h('div', { class: 'ad-app' },
      h('header', { class: 'ad-head' },
        h('div', null, h('h1', { class: 't-title' }, 'AIタスク'), els.sub),
        els.refresh),
      buildDemo(),
      els.live,
      els.notices,
      els.overview,
      h('section', { class: 'ad-filters', 'aria-label': '絞り込み' },
        h('span', { class: 't-label', id: 'agent-label' }, '担当AI'),
        els.agents,
        h('div', { class: 'ad-field ad-filters__search' }, h('label', { class: 'ad-sr', for: 'ad-q' }, 'タスクを検索'), els.search)),
      els.result,
      els.groups));
  }

  function buildDemo() {
    function radio(value, label) {
      return h('label', { class: 'ad-check t-body' },
        h('input', { type: 'radio', name: 'ad-demo-data', value: value, checked: state.dataMode === value, 'data-fk': 'demo-' + value,
          onChange: function () { setDataMode(value); } }), label);
    }
    els.demoFail = h('input', { type: 'checkbox', checked: state.failSend, onChange: function (e) { state.failSend = e.target.checked; say(e.target.checked ? '次の送信は失敗します' : '送信は成功します'); } });
    return h('details', { class: 'ad-demo' },
      h('summary', { class: 't-label' }, 'プロトタイプ用の切り替え（データ0件・エラー表示）'),
      h('div', { class: 'ad-demo__body' },
        h('fieldset', { class: 'ad-demo__set' }, h('legend', { class: 't-label' }, 'データ'), radio('normal', '12件'), radio('empty', '0件')),
        D.Button({ label: '読み込みエラーを起こす', variant: 'secondary', onClick: function () { state.loadError = true; render(); say('読み込みエラーを表示しました'); } }),
        h('label', { class: 'ad-check t-body' }, els.demoFail, '回答・再試行の送信を失敗させる'),
        D.Button({ label: '最初の状態に戻す', variant: 'quiet', onClick: resetAll })));
  }

  /* ---------- 描画 ---------- */
  function render() {
    var active = document.activeElement;
    var fk = active && active.getAttribute ? active.getAttribute('data-fk') : null;
    renderHead(); renderNotices(); renderOverview(); renderAgents(); renderResult(); renderList();
    var key = state.focusKey || fk;
    state.focusKey = null;
    if (key) {
      var target = root.querySelector('[data-fk="' + key + '"]');
      if (target && target !== document.activeElement) {
        target.focus();
        if (target.tagName === 'TEXTAREA' || (target.tagName === 'INPUT' && target.type === 'search')) target.selectionStart = target.selectionEnd = target.value.length;
      }
    }
  }

  function renderHead() {
    els.sub.textContent = 'Claude・Codex・GLM に頼んだ仕事 · ' + (state.loading ? '更新中…' : '最終更新 ' + D.formatClock(state.lastSync));
    els.refresh.textContent = '';
    els.refresh.appendChild(D.Button({ label: '更新', variant: 'secondary', busy: state.loading, busyLabel: '更新中…', fk: 'refresh', onClick: refresh }));
  }

  function renderNotices() {
    els.notices.textContent = '';
    if (!state.loadError) return;
    els.notices.appendChild(D.Notice({
      tone: 'error', title: 'タスク一覧を更新できませんでした',
      body: 'サーバーに接続できません（E-NET-503）。表示しているのは ' + D.formatClock(state.lastSync) + ' 時点の内容で、最新ではない可能性があります。',
      actions: [{ label: '再読み込み', variant: 'secondary', busy: state.loading, busyLabel: '読み込み中…', fk: 'reload', onClick: function () { refresh(true); } }]
    }));
  }

  function renderOverview() {
    var o = els.overview; o.textContent = '';
    var c = { wait: countBy('wait'), stop: countBy('stop'), run: countBy('run'), done: countBy('done') };
    function tile(s) {
      return D.SummaryTile({ status: s, count: c[s], pressed: state.filter.status === s, onClick: function () { setStatusFilter(state.filter.status === s ? null : s); } });
    }
    function group(label, n, tiles) {
      return h('div', { class: 'ad-tilegroup' },
        h('p', { class: 'ad-tilegroup__label t-heading' }, label + ' ', h('span', { class: 'ad-num' }, String(n)), '件'),
        h('div', { class: 'ad-tilegroup__tiles' }, tiles));
    }
    o.appendChild(h('h2', { id: 'ov-title', class: 'ad-sr' }, '全体の状況（押すと状態で絞り込み）'));
    o.appendChild(h('div', { class: 'ad-tiles' },
      group('止まっている', c.wait + c.stop, [tile('wait'), tile('stop')]),
      group('動いている', c.run, [tile('run')]),
      group('終わった', c.done, [tile('done')])));
    o.appendChild(renderNext());
  }

  function renderNext() {
    var w = oldest('wait'), s = oldest('stop'), now = Date.now();
    var text, btn = null;
    if (w) {
      text = [h('strong', null, agentName(w.agent)), ' が ', h('strong', { class: 'ad-num' }, D.formatDuration(w.since, now)), ' あなたの返答を待っています：「' + w.title + '」'];
      btn = D.Button({ label: '回答する', variant: 'primary', fk: 'next', onClick: function () { openFromAnywhere(w.id); } });
    } else if (s) {
      text = ['あなたの返答待ちはありません。AI停止中のタスクが ', h('strong', { class: 'ad-num' }, String(countBy('stop')) + '件'), ' あります：「' + s.title + '」'];
      btn = D.Button({ label: '対処する', variant: 'secondary', fk: 'next', onClick: function () { openFromAnywhere(s.id); } });
    } else if (state.tasks.length) {
      text = ['いま、あなたが対応するタスクはありません。'];
    } else {
      text = ['タスクはまだありません。'];
    }
    return h('div', { class: 'ad-next' },
      h('p', { class: 'ad-next__label t-label' }, '次にやること'),
      h('p', { class: 'ad-next__text t-body' }, text),
      btn);
  }

  function renderAgents() {
    var a = els.agents; a.textContent = '';
    a.appendChild(D.FilterChip({ label: 'すべて', count: state.tasks.length, pressed: !state.filter.agent, fk: 'agent-all', onClick: function () { setAgentFilter(null); } }));
    Object.keys(D.AGENTS).forEach(function (k) {
      var n = state.tasks.filter(function (t) { return t.agent === k; }).length;
      a.appendChild(D.FilterChip({ label: D.AGENTS[k].name, count: n, pressed: state.filter.agent === k, fk: 'agent-' + k, onClick: function () { setAgentFilter(state.filter.agent === k ? null : k); } }));
    });
  }

  function renderResult() {
    var r = els.result; r.textContent = '';
    var shown = state.tasks.filter(matches).length;
    var parts = [];
    if (state.filter.status) parts.push('状態：' + D.STATUS[state.filter.status].label);
    if (state.filter.agent) parts.push('担当：' + agentName(state.filter.agent));
    if (state.filter.q.trim()) parts.push('「' + state.filter.q.trim() + '」');
    r.appendChild(h('span', { class: 'ad-num' }, state.tasks.length + '件中 ' + shown + '件を表示' + (parts.length ? '（' + parts.join('・') + '）' : '')));
    if (filterActive()) r.appendChild(D.Button({ label: '絞り込みを解除', variant: 'quiet', fk: 'clear', onClick: clearFilters }));
  }

  function renderList() {
    var g = els.groups; g.textContent = '';
    g.setAttribute('aria-busy', state.loading ? 'true' : 'false');
    if (!state.tasks.length) {
      g.appendChild(D.EmptyState({ title: 'まだタスクがありません', body: 'Claude・Codex・GLM に仕事を頼むと、ここに状況が並びます。止まっている仕事があれば、いちばん上に出ます。' }));
      return;
    }
    var visible = state.tasks.filter(matches);
    if (!visible.length) {
      g.appendChild(D.EmptyState({ title: '条件に合うタスクはありません', body: '絞り込みや検索の条件を変えるか、解除してください。',
        action: { label: '絞り込みを解除', variant: 'secondary', fk: 'clear-empty', onClick: clearFilters } }));
      return;
    }
    var now = Date.now();
    D.ORDER.forEach(function (s) {
      var rows = sortGroup(visible.filter(function (t) { return groupOf(t) === s; }), s);
      if (!rows.length) return;
      var st = D.STATUS[s];
      g.appendChild(h('section', { class: 'ad-group', 'aria-labelledby': 'grp-' + s },
        h('h2', { class: 'ad-group__head t-heading', id: 'grp-' + s }, D.StatusMark({ status: s, large: true }), st.group,
          h('span', { class: 'ad-group__count ad-num' }, countBy(s) + '件')),
        h('ul', { class: 'ad-list' }, rows.map(function (t) {
          return D.TaskRow({ task: t, now: now, expanded: state.openId === t.id, onToggle: toggle, detail: state.openId === t.id ? renderDetail(t, now) : null });
        }))));
    });
  }

  /* ---------- 詳細 ---------- */
  function renderDetail(t, now) {
    var main = [];
    var f = state.flash[t.id];
    if (f) main.push(D.Notice({ tone: 'success', title: f.title, body: f.body, focusable: true, fk: 'flash-' + t.id,
      actions: [{ label: '取り消す', variant: 'secondary', fk: 'undo-' + t.id, onClick: function () { undo(t.id); } }, { label: '閉じる', variant: 'quiet', fk: 'close-' + t.id, onClick: function () { toggle(t.id); } }] }));

    if (t.status === 'wait') {
      main.push(D.AnswerForm({ id: t.id, agent: t.agent, question: t.question, draft: state.drafts[t.id], error: state.errors[t.id], busy: state.busyId === t.id,
        onChange: function (patch) { onDraft(t.id, patch); }, onSubmit: function () { submitAnswer(t.id); }, onLater: function () { toggle(t.id); } }));
    } else if (t.status === 'stop') {
      main.push(renderStop(t));
    } else if (t.status === 'run') {
      main.push(renderRun(t, now));
    } else {
      main.push(renderDone(t));
    }

    var side = [
      h('div', { class: 'ad-detail__section' },
        h('h4', { class: 't-label', style: 'margin:0' }, 'タスク情報'),
        h('dl', { class: 'ad-meta t-body' },
          h('dt', null, '担当AI'), h('dd', null, agentName(t.agent)),
          h('dt', null, 'タスクID'), h('dd', { class: 'ad-num' }, t.id),
          h('dt', null, '依頼'), h('dd', { class: 'ad-num' }, D.formatClock(t.createdAt)),
          h('dt', null, '最終更新'), h('dd', { class: 'ad-num' }, D.formatClock(t.updatedAt) + '（' + D.formatAgo(t.updatedAt, now) + '）'))),
      h('div', { class: 'ad-detail__section' },
        h('h4', { class: 't-label', style: 'margin:0' }, '経過（新しい順）'),
        h('ol', { class: 'ad-log t-body' }, t.log.slice().reverse().slice(0, 6).map(function (e) {
          return h('li', null, h('time', { class: 't-meta ad-num' }, D.formatClock(e.at).split(' ')[1]),
            h('span', null, h('span', { class: 'ad-log__who' }, e.who === 'you' ? 'あなた' : agentName(e.who)), e.text));
        })))
    ];
    return h('div', { class: 'ad-detail' }, h('div', { class: 'ad-detail__main' }, main), h('div', { class: 'ad-detail__side' }, side));
  }

  function renderStop(t) {
    var e = t.error, busy = state.busyId === t.id;
    var others = Object.keys(D.AGENTS).filter(function (k) { return k !== t.agent; });
    var pick = state.reassign[t.id] || others[0];
    var selId = 'reassign-' + t.id;
    return h('div', { class: 'ad-detail__section' },
      h('div', { class: 'ad-panel ad-panel--stop' },
        h('p', { class: 'ad-panel__head t-label' }, D.StatusMark({ status: 'stop' }), '停止の理由'),
        h('p', { class: 't-body', style: 'font-weight:600' }, e.message),
        h('p', { class: 't-body' }, e.detail),
        h('p', { class: 't-meta' }, 'エラーコード ', h('code', { class: 't-code' }, e.code))),
      h('h4', { class: 't-label', style: 'margin:var(--space-2) 0 0' }, 'あなたにできること'),
      h('p', { class: 't-body' }, e.hint),
      h('div', { class: 'ad-actions' },
        D.Button({ label: '再試行', variant: 'primary', busy: busy && state.busyKind === 'retry', busyLabel: '再試行中…', fk: 'retry-' + t.id, onClick: function () { retry(t.id); } })),
      h('div', { class: 'ad-reassign' },
        h('div', { class: 'ad-field' },
          h('label', { class: 't-label', for: selId }, '別のAIに引き継ぐ'),
          h('select', { id: selId, class: 'ad-select t-body', 'data-fk': 'sel-' + t.id, onChange: function (ev) { state.reassign[t.id] = ev.target.value; } },
            others.map(function (k) { var o = h('option', { value: k }, agentName(k)); if (k === pick) o.selected = true; return o; }))),
        D.Button({ label: '引き継ぐ', variant: 'secondary', busy: busy && state.busyKind === 'reassign', busyLabel: '引き継ぎ中…', fk: 'hand-' + t.id, onClick: function () { reassign(t.id); } })),
      state.errors[t.id] ? h('p', { class: 'ad-error t-label', role: 'alert', tabindex: '-1', 'data-fk': 'err-' + t.id }, D.StatusMark({ status: 'stop' }), state.errors[t.id]) : null);
  }

  function renderRun(t, now) {
    var p = t.progress;
    return h('div', { class: 'ad-detail__section' },
      h('h4', { class: 't-label', style: 'margin:0' }, 'いまの作業'),
      h('p', { class: 't-body' }, p.current + '（' + D.formatAgo(t.updatedAt, now) + 'に更新）'),
      h('h4', { class: 't-label', style: 'margin:var(--space-2) 0 0' }, '進み具合 ', h('span', { class: 'ad-num' }, p.done + '/' + p.total)),
      h('ol', { class: 'ad-steps t-body' }, (t.steps || []).map(function (name, i) {
        var kind = i < p.done ? 'done' : (i === p.done ? 'run' : 'todo');
        return h('li', { class: kind === 'run' ? 'is-current' : (kind === 'todo' ? 'is-todo' : null) },
          D.StatusMark({ status: kind }), name,
          h('span', { class: 'ad-sr' }, kind === 'done' ? '（済み）' : kind === 'run' ? '（作業中）' : '（未着手）'),
          kind === 'run' ? h('span', { class: 't-meta', 'aria-hidden': 'true' }, '← いまここ') : null);
      })),
      h('p', { class: 't-meta' }, 'あなたの操作は不要です。止まったり質問が来たりすると、このページの上部に出ます。'));
  }

  function renderDone(t) {
    return h('div', { class: 'ad-detail__section' },
      h('h4', { class: 't-label', style: 'margin:0' }, '成果'),
      h('p', { class: 't-body' }, t.result.summary),
      h('h4', { class: 't-label', style: 'margin:var(--space-2) 0 0' }, '成果物'),
      h('ul', { class: 'ad-files' }, t.result.files.map(function (f) { return h('li', null, h('code', { class: 't-code' }, f)); })));
  }

  /* ---------- 操作 ---------- */
  function say(msg) { els.live.textContent = ''; setTimeout(function () { els.live.textContent = msg; }, 30); }

  function releaseHold(exceptId) {
    if (state.hold && state.hold.id !== exceptId) { delete state.flash[state.hold.id]; state.hold = null; }
  }

  function toggle(id, via) {
    var t = find(id);
    if (state.openId === id) {
      state.openId = null;
      releaseHold();
      state.focusKey = 'toggle-' + id;
    } else {
      releaseHold(id);
      state.openId = id;
      if (via === 'action') {
        if (t.status === 'wait') state.focusKey = t.question.options && t.question.options.length ? 'opt-' + id + '-0' : 'note-' + id;
        else if (t.status === 'stop') state.focusKey = 'retry-' + id;
      }
    }
    render();
  }

  function openFromAnywhere(id) {
    var t = find(id);
    if (!matches(t)) { state.filter = { status: null, agent: null, q: '' }; els.search.value = ''; say('絞り込みを解除しました'); }
    if (state.openId !== id) { releaseHold(id); state.openId = id; }
    state.focusKey = t.status === 'wait' ? 'opt-' + id + '-0' : 'retry-' + id;
    render();
  }

  function setStatusFilter(s) { state.filter.status = s; releaseHold(); render(); say(s ? D.STATUS[s].label + 'で絞り込みました' : '状態の絞り込みを解除しました'); }
  function setAgentFilter(a) { state.filter.agent = a; releaseHold(); render(); say(a ? agentName(a) + 'のタスクに絞り込みました' : '担当AIの絞り込みを解除しました'); }
  function clearFilters() {
    state.filter = { status: null, agent: null, q: '' }; els.search.value = ''; releaseHold();
    state.focusKey = 'agent-all'; render(); say('絞り込みを解除しました');
  }

  function onDraft(id, patch) {
    var d = state.drafts[id] || (state.drafts[id] = {});
    for (var k in patch) d[k] = patch[k];
    if (state.errors[id]) { delete state.errors[id]; render(); }
  }

  function failOrRun(id, kind, ok) {
    if (state.busyId) return;
    state.busyId = id; state.busyKind = kind; delete state.errors[id];
    render();
    setTimeout(function () {
      state.busyId = null; state.busyKind = null;
      if (state.failSend) {
        state.errors[id] = '送信できませんでした（通信エラー E-SEND-504）。' + (kind === 'answer' ? '入力した内容は残っています。もう一度「回答を送信」を押してください。' : '状態は変わっていません。時間をおいて、もう一度押してください。');
        state.openId = id; state.focusKey = 'err-' + id;
        render(); return;
      }
      ok(); render();
    }, SEND_DELAY);
  }

  function resumeTask(t, logText) {
    var now = Date.now();
    var snap = clone(t);
    t.status = 'run'; t.updatedAt = now;
    if (t.resume) t.progress = { done: t.progress.done, total: t.progress.total, current: t.resume };
    t.log.push({ at: now, who: 'you', text: logText });
    t.log.push({ at: now, who: t.agent, text: '作業を再開' });
    delete t.question; delete t.error;
    return snap;
  }

  function submitAnswer(id) {
    if (state.busyId) return;
    var t = find(id), d = state.drafts[id] || {};
    var hasOpt = t.question.options && t.question.options.length;
    if (!d.option && !(d.note || '').trim()) {
      state.errors[id] = hasOpt ? '選択肢を1つ選ぶか、補足欄に回答を書いてください。' : '回答を入力してください。';
      state.focusKey = 'err-' + id; render(); say(state.errors[id]); return;
    }
    failOrRun(id, 'answer', function () {
      var opt = hasOpt ? t.question.options.filter(function (o) { return o.id === d.option; })[0] : null;
      var text = '回答：' + (opt ? opt.label : '') + ((d.note || '').trim() ? (opt ? '／' : '') + d.note.trim() : '');
      var snap = resumeTask(t, text);
      state.flash[id] = { snap: snap, draft: clone(d), title: '回答を送信しました', body: agentName(t.agent) + ' が作業を再開しました。状態は「作業中」に変わりました。この行は閉じると「作業中」に移ります。' };
      delete state.drafts[id];
      state.hold = { id: id, group: 'wait' };
      state.focusKey = 'flash-' + id;
      say('回答を送信しました。' + agentName(t.agent) + ' が作業を再開しました。');
    });
  }

  function retry(id) {
    var t = find(id);
    failOrRun(id, 'retry', function () {
      var snap = resumeTask(t, '再試行を指示');
      state.flash[id] = { snap: snap, title: '再試行しました', body: agentName(t.agent) + ' が作業を再開しました。状態は「作業中」に変わりました。この行は閉じると「作業中」に移ります。' };
      state.hold = { id: id, group: 'stop' };
      state.focusKey = 'flash-' + id;
      say('再試行しました。' + agentName(t.agent) + ' が作業を再開しました。');
    });
  }

  function reassign(id) {
    var t = find(id);
    var others = Object.keys(D.AGENTS).filter(function (k) { return k !== t.agent; });
    var to = state.reassign[id] || others[0];
    failOrRun(id, 'reassign', function () {
      var from = t.agent;
      var snap = resumeTask(t, agentName(from) + ' から ' + agentName(to) + ' へ引き継ぎ');
      t.agent = to;
      t.log[t.log.length - 1].who = to;
      delete state.reassign[id];
      state.flash[id] = { snap: snap, title: agentName(to) + ' に引き継ぎました', body: agentName(to) + ' が続きから作業を始めました。状態は「作業中」に変わりました。この行は閉じると「作業中」に移ります。' };
      state.hold = { id: id, group: 'stop' };
      state.focusKey = 'flash-' + id;
      say(agentName(to) + ' に引き継ぎました。');
    });
  }

  function undo(id) {
    var f = state.flash[id]; if (!f) return;
    for (var i = 0; i < state.tasks.length; i++) if (state.tasks[i].id === id) state.tasks[i] = f.snap;
    if (f.draft) state.drafts[id] = f.draft;
    delete state.flash[id]; state.hold = null; state.openId = id;
    state.focusKey = 'toggle-' + id;
    render(); say('取り消しました。元の状態に戻しました。');
  }

  function refresh(fromBanner) {
    if (state.loading) return;
    state.loading = true; render();
    setTimeout(function () {
      state.loading = false; state.loadError = false; state.lastSync = Date.now();
      state.focusKey = fromBanner === true ? 'refresh' : null;
      render(); say('最新の状態に更新しました');
    }, 800);
  }

  function setDataMode(mode) {
    state.dataMode = mode; state.openId = null; state.hold = null; state.flash = {};
    state.tasks = mode === 'empty' ? [] : seed(Date.now());
    render(); say(mode === 'empty' ? 'データを0件にしました' : '12件のデータに戻しました');
  }

  function resetAll() {
    state = initialState(); build(); render(); say('最初の状態に戻しました');
  }

  build();
  render();
})();
