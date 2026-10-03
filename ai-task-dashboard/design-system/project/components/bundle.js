/* @ds-bundle: {"format":4,"namespace":"AIDash","components":[{"name":"StatusBadge"},{"name":"Button"},{"name":"AgentTag"},{"name":"SummaryTile"},{"name":"FilterChip"},{"name":"TaskRow"},{"name":"AnswerForm"},{"name":"Notice"},{"name":"EmptyState"}]} */
/* AIタスク ダッシュボードの部品。ライブラリ不要。各関数は props を受け取り HTMLElement を返す。 */
(function () {
  'use strict';

  var STATUS = {
    wait: { key: 'wait', label: '確認待ち', long: 'あなたの確認待ち', group: 'あなたの返答待ち', note: 'あなたの返答で再開', moving: false },
    stop: { key: 'stop', label: 'AI停止', long: 'AI側の問題で停止', group: 'AI側の問題で停止', note: 'AI側の対処が必要', moving: false },
    run: { key: 'run', label: '作業中', long: '作業中', group: '作業中', note: 'AIが進めています', moving: true },
    done: { key: 'done', label: '完了', long: '完了', group: '完了', note: '成果を確認できます', moving: false }
  };
  var ORDER = ['wait', 'stop', 'run', 'done'];
  var AGENTS = {
    claude: { key: 'claude', name: 'Claude' },
    codex: { key: 'codex', name: 'Codex' },
    glm: { key: 'glm', name: 'GLM' }
  };

  /* --- 小さな DOM ヘルパー --- */
  function h(tag, props) {
    var el = document.createElement(tag);
    if (props) {
      for (var k in props) {
        if (!Object.prototype.hasOwnProperty.call(props, k)) continue;
        var v = props[k];
        if (v === null || v === undefined || v === false) continue;
        if (k === 'class') el.className = v;
        else if (k === 'text') el.textContent = v;
        else if (k === 'value') el.value = v;
        else if (k === 'checked') { el.checked = !!v; el.setAttribute('checked', ''); }
        else if (k.slice(0, 2) === 'on' && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
        else el.setAttribute(k, v === true ? '' : String(v));
      }
    }
    for (var i = 2; i < arguments.length; i++) append(el, arguments[i]);
    return el;
  }
  function append(el, child) {
    if (child === null || child === undefined || child === false) return;
    if (Array.isArray(child)) { child.forEach(function (c) { append(el, c); }); return; }
    el.appendChild(typeof child === 'string' || typeof child === 'number' ? document.createTextNode(String(child)) : child);
  }
  function cx() { return Array.prototype.filter.call(arguments, Boolean).join(' '); }

  /* --- 記号（SVG）。絵文字化を避けるため文字ではなく図形で描く --- */
  var SVGNS = 'http://www.w3.org/2000/svg';
  function svg(shapes) {
    var s = document.createElementNS(SVGNS, 'svg');
    s.setAttribute('viewBox', '0 0 16 16');
    s.setAttribute('aria-hidden', 'true');
    s.setAttribute('focusable', 'false');
    shapes.forEach(function (d) {
      var el = document.createElementNS(SVGNS, d[0]);
      for (var k in d[1]) el.setAttribute(k, d[1][k]);
      s.appendChild(el);
    });
    return s;
  }
  var STROKE = { fill: 'none', stroke: 'currentColor', 'stroke-width': '2.2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' };
  function withStroke(o) { var r = {}; for (var k in STROKE) r[k] = STROKE[k]; for (var j in o) r[j] = o[j]; return r; }
  var GLYPHS = {
    run: function () { return svg([['path', { d: 'M5.2 3.4v9.2l7.4-4.6z', fill: 'currentColor' }]]); },
    wait: function () { return svg([['path', withStroke({ d: 'M5.6 6a2.4 2.4 0 1 1 3.5 2.1c-.75.4-1.1.9-1.1 1.7v.3' })], ['circle', { cx: '8', cy: '13', r: '1.25', fill: 'currentColor' }]]); },
    stop: function () { return svg([['rect', { x: '6.85', y: '2.6', width: '2.3', height: '7.4', rx: '1.15', fill: 'currentColor' }], ['circle', { cx: '8', cy: '12.9', r: '1.35', fill: 'currentColor' }]]); },
    done: function () { return svg([['path', withStroke({ d: 'M3.6 8.4l2.9 2.9 5.9-6.4' })]]); },
    todo: function () { return svg([]); },
    check: function () { return svg([['path', withStroke({ d: 'M3.6 8.4l2.9 2.9 5.9-6.4' })]]); },
    info: function () { return svg([['rect', { x: '6.85', y: '6.4', width: '2.3', height: '7', rx: '1.15', fill: 'currentColor' }], ['circle', { cx: '8', cy: '3.6', r: '1.35', fill: 'currentColor' }]]); }
  };

  /* --- 時刻表示 --- */
  function formatAgo(ms, now) {
    var min = Math.max(0, Math.round(((now || Date.now()) - ms) / 60000));
    if (min < 1) return 'たった今';
    if (min < 60) return min + '分前';
    var hr = Math.floor(min / 60);
    if (hr < 24) return hr + '時間' + (min % 60 ? (min % 60) + '分' : '') + '前';
    return Math.floor(hr / 24) + '日前';
  }
  function formatDuration(ms, now) {
    var min = Math.max(0, Math.round(((now || Date.now()) - ms) / 60000));
    if (min < 1) return '1分未満';
    if (min < 60) return min + '分';
    var hr = Math.floor(min / 60);
    return hr + '時間' + (min % 60 ? (min % 60) + '分' : '');
  }
  function formatClock(ms) {
    var d = new Date(ms);
    var p = function (n) { return (n < 10 ? '0' : '') + n; };
    return (d.getMonth() + 1) + '/' + d.getDate() + ' ' + p(d.getHours()) + ':' + p(d.getMinutes());
  }

  /* --- StatusMark / StatusBadge --- */
  function StatusMark(props) {
    var s = props.status;
    return h('span', { class: cx('ad-mark', 'ad-mark--' + s, props.large && 'ad-mark--lg'), 'aria-hidden': 'true' }, (GLYPHS[s] || GLYPHS.todo)());
  }
  function StatusBadge(props) {
    var st = STATUS[props.status];
    return h('span', { class: cx('ad-badge', 'ad-badge--' + props.status, 't-tag'), title: st.long },
      StatusMark({ status: props.status }),
      h('span', { text: props.label || st.label }));
  }

  /* --- Button --- */
  function Button(props) {
    var busy = !!props.busy;
    return h('button', {
      type: props.type || 'button',
      class: cx('ad-btn', 'ad-btn--' + (props.variant || 'secondary'), props.block && 'ad-btn--block', 't-label', props.className),
      disabled: props.disabled || null,
      'aria-busy': busy ? 'true' : null,
      'aria-disabled': busy ? 'true' : null,
      'aria-expanded': props.expanded === undefined ? null : String(!!props.expanded),
      'aria-controls': props.controls || null,
      'aria-describedby': props.describedBy || null,
      'data-fk': props.fk || null,
      onClick: function (e) { if (busy) { e.preventDefault(); return; } if (props.onClick) props.onClick(e); }
    }, busy ? (props.busyLabel || '送信中…') : props.label);
  }

  /* --- AgentTag --- */
  function AgentTag(props) {
    var a = AGENTS[props.agent] || { name: props.agent };
    return h('span', { class: 'ad-agent t-tag' }, a.name);
  }

  /* --- SummaryTile --- */
  function SummaryTile(props) {
    var st = STATUS[props.status];
    var pressed = !!props.pressed;
    return h('button', {
      type: 'button',
      class: cx('ad-tile', 'ad-tile--' + props.status),
      'aria-pressed': String(pressed),
      'data-fk': props.fk || ('tile-' + props.status),
      onClick: props.onClick
    },
      StatusMark({ status: props.status, large: true }),
      h('span', { class: 'ad-tile__word t-tag' }, st.label),
      h('span', { class: 'ad-tile__count t-count ad-num' }, String(props.count), h('span', { class: 'ad-sr' }, '件')),
      pressed
        ? h('span', { class: 'ad-tile__note ad-tile__note--on t-meta' }, GLYPHS.check(), '絞り込み中')
        : h('span', { class: 'ad-tile__note t-meta' }, props.note || st.note));
  }

  /* --- FilterChip --- */
  function FilterChip(props) {
    return h('button', {
      type: 'button',
      class: 'ad-chip t-tag',
      'aria-pressed': String(!!props.pressed),
      'data-fk': props.fk || null,
      onClick: props.onClick
    },
      h('span', { class: 'ad-chip__check', 'aria-hidden': 'true' }, GLYPHS.check()),
      h('span', null, props.label),
      props.count === undefined ? null : h('span', { class: 'ad-chip__count ad-num' }, String(props.count)));
  }

  /* --- Progress --- */
  function Progress(props) {
    var pct = props.total ? Math.round(props.done / props.total * 100) : 0;
    return h('span', { class: 'ad-progress' },
      h('span', { class: 'ad-progress__bar', role: 'img', 'aria-label': '進捗 ' + props.total + 'ステップ中 ' + props.done + 'ステップ完了' },
        h('span', { class: 'ad-progress__fill', style: 'width:' + pct + '%' })),
      h('span', { class: 't-meta ad-num', 'aria-hidden': 'true' }, props.done + '/' + props.total));
  }

  /* --- TaskRow --- */
  function rowLine(task) {
    if (task.status === 'wait' && task.question) return [h('span', { class: 'ad-row__lead ad-row__lead--wait' }, '質問'), task.question.text];
    if (task.status === 'stop' && task.error) return [h('span', { class: 'ad-row__lead ad-row__lead--stop' }, '停止理由'), task.error.message];
    if (task.status === 'run' && task.progress) return [h('span', { class: 'ad-row__lead' }, '進行'), task.progress.current];
    if (task.status === 'done' && task.result) return [h('span', { class: 'ad-row__lead' }, '成果'), task.result.summary];
    return null;
  }
  function sinceText(task, now) {
    if (task.status === 'wait') return formatDuration(task.since, now) + '待ち';
    if (task.status === 'stop') return formatDuration(task.since, now) + '停止中';
    if (task.status === 'run') return formatAgo(task.updatedAt, now) + 'に更新';
    return formatAgo(task.updatedAt, now) + 'に完了';
  }
  function TaskRow(props) {
    var t = props.task, now = props.now || Date.now();
    var open = !!props.expanded;
    var detailId = 'detail-' + t.id;
    var actionLabel = { wait: '回答する', stop: '対処する', run: '詳細', done: '詳細' }[t.status];
    var variant = t.status === 'wait' ? 'primary' : (t.status === 'stop' ? 'secondary' : 'quiet');
    if (open) { actionLabel = '閉じる'; variant = 'quiet'; }
    var line = rowLine(t);
    var row = h('li', { class: cx('ad-row', 'ad-row--' + t.status, open && 'is-open'), 'data-id': t.id },
      h('div', { class: 'ad-row__main' },
        h('div', { class: 'ad-row__status' },
          StatusBadge({ status: t.status }),
          h('span', { class: 'ad-row__since t-meta ad-num' }, sinceText(t, now))),
        h('div', { class: 'ad-row__body' },
          h('h3', { class: 'ad-row__title t-task' },
            h('button', { type: 'button', class: 'ad-row__toggle t-task', 'aria-expanded': String(open), 'aria-controls': detailId, 'data-fk': 'toggle-' + t.id, onClick: function () { props.onToggle && props.onToggle(t.id, 'title'); } }, t.title)),
          line && !open ? h('p', { class: 'ad-row__line t-body' }, line) : null,
          h('div', { class: 'ad-row__meta t-meta' },
            AgentTag({ agent: t.agent }),
            t.status === 'run' && t.progress ? Progress({ done: t.progress.done, total: t.progress.total }) : null,
            h('span', { class: 'ad-num' }, t.id))),
        h('div', { class: 'ad-row__action' },
          Button({ label: actionLabel, variant: variant, expanded: open, controls: detailId, fk: 'act-' + t.id,
            onClick: function () { props.onToggle && props.onToggle(t.id, 'action'); } }))),
      h('div', { class: 'ad-row__detail', id: detailId, hidden: open ? null : true }, open ? props.detail : null));
    return row;
  }

  /* --- AnswerForm --- */
  function AnswerForm(props) {
    var q = props.question, id = props.id, draft = props.draft || {};
    var errId = 'err-' + id, noteId = 'note-' + id;
    var agentName = (AGENTS[props.agent] || { name: props.agent }).name;
    var options = (q.options || []).map(function (o, i) {
      return h('label', { class: 'ad-option' },
        h('input', { type: 'radio', name: 'opt-' + id, value: o.id, checked: draft.option === o.id, 'data-fk': 'opt-' + id + '-' + i,
          onChange: function () { props.onChange && props.onChange({ option: o.id }); } }),
        h('span', { class: 'ad-option__text' },
          h('span', { class: 't-label' }, o.label),
          o.hint ? h('span', { class: 'ad-option__hint t-meta' }, o.hint) : null));
    });
    var form = h('form', { class: 'ad-answer', novalidate: true, onSubmit: function (e) { e.preventDefault(); props.onSubmit && props.onSubmit(); } },
      h('div', { class: 'ad-panel ad-panel--wait' },
        h('p', { class: 'ad-panel__head t-label' }, StatusMark({ status: 'wait' }), agentName + ' からあなたへの質問'),
        h('p', { class: 't-body', style: 'font-weight:600' }, q.text),
        q.context ? h('p', { class: 't-body' }, q.context) : null),
      options.length ? h('fieldset', { 'aria-invalid': props.error ? 'true' : null, 'aria-describedby': props.error ? errId : null },
        h('legend', { class: 't-label' }, '回答を1つ選んでください'),
        options) : null,
      h('div', { class: 'ad-field' },
        h('label', { class: 't-label', for: noteId }, options.length ? '補足（任意）' : '回答'),
        h('textarea', { id: noteId, class: 'ad-input t-body', rows: 3, 'data-fk': 'note-' + id, value: draft.note || '',
          placeholder: options.length ? '例：未分類フォルダの名前は「要確認」にしてください' : '回答を入力',
          'aria-invalid': props.error && !options.length ? 'true' : null,
          onInput: function (e) { props.onChange && props.onChange({ note: e.target.value }); } })),
      props.error ? h('p', { class: 'ad-error t-label', id: errId, role: 'alert', tabindex: '-1', 'data-fk': 'err-' + id }, StatusMark({ status: 'stop' }), props.error) : null,
      h('div', { class: 'ad-actions' },
        Button({ type: 'submit', variant: 'primary', label: '回答を送信', busy: props.busy, busyLabel: '送信中…', fk: 'submit-' + id }),
        Button({ variant: 'quiet', label: 'あとで', fk: 'later-' + id, onClick: function () { props.onLater && props.onLater(); } })),
      h('p', { class: 'ad-answer__after t-meta' }, '送信すると ' + agentName + ' が作業を再開し、状態が「作業中」に変わります。'));
    return form;
  }

  /* --- Notice --- */
  function Notice(props) {
    var tone = props.tone || 'info';
    var markStatus = { error: 'stop', success: 'done', info: null }[tone];
    var mark = markStatus ? StatusMark({ status: markStatus, large: true }) : h('span', { class: 'ad-mark ad-mark--lg ad-mark--todo', 'aria-hidden': 'true' }, GLYPHS.info());
    return h('div', { class: cx('ad-notice', 'ad-notice--' + tone), role: props.role || (tone === 'error' ? 'alert' : 'status'), tabindex: props.focusable ? '-1' : null, 'data-fk': props.fk || null },
      mark,
      h('div', { class: 'ad-notice__text' },
        props.title ? h('p', { class: 'ad-notice__title t-label' }, props.title) : null,
        props.body ? h('p', { class: 'ad-notice__body t-body' }, props.body) : null),
      props.actions && props.actions.length ? h('div', { class: 'ad-notice__actions' }, props.actions.map(Button)) : null);
  }

  /* --- EmptyState --- */
  function EmptyState(props) {
    return h('div', { class: 'ad-empty', role: 'status' },
      h('p', { class: 'ad-empty__title t-heading' }, props.title),
      props.body ? h('p', { class: 'ad-empty__body t-body' }, props.body) : null,
      props.action ? Button(props.action) : null);
  }

  var ns = window.AIDash || (window.AIDash = {});
  var api = {
    STATUS: STATUS, ORDER: ORDER, AGENTS: AGENTS, GLYPHS: GLYPHS,
    h: h, formatAgo: formatAgo, formatDuration: formatDuration, formatClock: formatClock,
    StatusMark: StatusMark, StatusBadge: StatusBadge, Button: Button, AgentTag: AgentTag,
    SummaryTile: SummaryTile, FilterChip: FilterChip, Progress: Progress, TaskRow: TaskRow,
    AnswerForm: AnswerForm, Notice: Notice, EmptyState: EmptyState
  };
  for (var k in api) ns[k] = api[k];
})();
