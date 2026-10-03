#!/usr/bin/env python3
"""デザインシステムの tokens.json と部品から、次の2つを組み立てる。

- design-system/project/components/Dashboard/preview.html … デザインシステム内の画面カード
- index.html … ブラウザで直接開ける単体版（通信なし）

使い方: python3 build.py
"""
import json
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent
PROJECT = ROOT / "design-system" / "project"
COMP = PROJECT / "components"
SRC = ROOT / "src"


def css_value(v):
    m = re.fullmatch(r"\{([A-Za-z0-9_.-]+)\}", v) if isinstance(v, str) else None
    return f"var(--{m.group(1)})" if m else v


def tokens_css(tokens):
    """ページが生成する tokens.css と同じ形を単体版のために作る。"""
    themes = [t["id"] for t in tokens["color"]["themes"]]
    first = themes[0]
    themed = tokens["color"]["tokens"] + tokens.get("shadow", {}).get("tokens", [])

    def block(theme):
        lines = []
        for t in themed:
            v = t["value"]
            if isinstance(v, dict):
                val = v.get(theme, v.get(first))
            else:
                val = v
            lines.append(f"  --{t['name']}: {css_value(val)};")
        return "\n".join(lines)

    out = [f':root, [data-theme="{first}"] {{\n{block(first)}\n}}']
    for th in themes[1:]:
        out.append(f'[data-theme="{th}"] {{\n{block(th)}\n}}')
        out.append(f'@media (prefers-color-scheme: {th}) {{\n  :root:not([data-theme]) {{\n{block(th)}\n  }}\n}}')
    plain = []
    for fam in ("spacing", "radius", "size"):
        for t in tokens.get(fam, {}).get("tokens", []):
            plain.append(f"  --{t['name']}: {t['value']};")
    for key, stack in tokens["type"]["families"].items():
        plain.append(f"  --font-{key}: {stack};")
    out.append(":root {\n" + "\n".join(plain) + "\n}")
    for g in tokens["type"]["groups"]:
        for s in g["styles"]:
            fam = s.get("family", g["family"])
            out.append(
                f".{s['name']} {{ font-family: var(--font-{fam}); font-size: {s['fontSize']}; "
                f"line-height: {s['lineHeight']}; font-weight: {s['fontWeight']}; }}"
            )
    return "\n".join(out) + "\n"


def check_inline(name, text):
    for bad in ("</script", "<!--"):
        if bad in text.lower():
            raise SystemExit(f"{name} contains {bad!r}; it cannot be inlined")


def main():
    tokens = json.loads((PROJECT / "tokens.json").read_text(encoding="utf-8"))
    bundle_js = (COMP / "bundle.js").read_text(encoding="utf-8")
    bundle_css = (COMP / "bundle.css").read_text(encoding="utf-8")
    app_js = (SRC / "dashboard.js").read_text(encoding="utf-8")
    app_css = (SRC / "dashboard.css").read_text(encoding="utf-8")
    check_inline("bundle.js", bundle_js)
    check_inline("dashboard.js", app_js)

    preview = (
        '<!-- @dsCard group="画面" height=2300 page subtitle="操作できるプロトタイプ：絞り込み・詳細・回答・状態変更・0件・エラー" -->\n'
        "<!doctype html>\n"
        '<html lang="ja">\n<head>\n<meta charset="utf-8">\n'
        '<meta name="viewport" content="width=device-width, initial-scale=1">\n'
        "<title>AIタスク — ダッシュボード</title>\n"
        f"<style>\n{app_css}</style>\n</head>\n<body>\n"
        '<div id="ad-root"></div>\n'
        f"<script>\n{app_js}</script>\n</body>\n</html>\n"
    )
    out = COMP / "Dashboard" / "preview.html"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(preview, encoding="utf-8")

    standalone = (
        "<!doctype html>\n"
        '<html lang="ja">\n<head>\n<meta charset="utf-8">\n'
        '<meta name="viewport" content="width=device-width, initial-scale=1">\n'
        "<title>AIタスク ダッシュボード</title>\n"
        f"<style>\n/* tokens.css（tokens.json から生成） */\n{tokens_css(tokens)}\n"
        f"/* components/bundle.css */\n{bundle_css}\n/* dashboard.css */\n{app_css}</style>\n"
        "</head>\n<body>\n"
        '<div id="ad-root"></div>\n'
        f"<script>\n{bundle_js}</script>\n<script>\n{app_js}</script>\n"
        "</body>\n</html>\n"
    )
    (ROOT / "index.html").write_text(standalone, encoding="utf-8")
    print("wrote", out.relative_to(ROOT), "and index.html")


if __name__ == "__main__":
    main()
