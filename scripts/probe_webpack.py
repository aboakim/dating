import re
import pathlib
import urllib.request
import json

root = pathlib.Path(r"c:\Users\HP\Desktop\teplo\.tmp-onlyteplo")
webpack = (root / "webpack.js").read_text(encoding="utf-8", errors="ignore")

# Next.js webpack chunk map often looks like: {1234:"hash",...} or e.u=e=>...
# Extract all static chunk filenames from webpack
files = sorted(set(re.findall(r"static/chunks/[^\"']+\.js", webpack)))
print("files in webpack", len(files))
for f in files:
    if "meeting" in f or "app/" in f:
        print(f)

# Try common pattern for chunk id map
m = re.search(r"\{(\d+:\"[a-f0-9]+\",?){20,}\}", webpack)
if m:
    print("map snippet", m.group(0)[:300])

# Download layout chunk and search for dynamic imports
layout = urllib.request.urlopen(
    urllib.request.Request(
        "https://onlyteplo.ru/_next/static/chunks/app/meeting/layout-c1cd6ecc0c3d7209.js",
        headers={"User-Agent": "Mozilla/5.0"},
    )
).read().decode("utf-8", "ignore")
(root / "meeting-layout.js").write_text(layout, encoding="utf-8")
print("layout len", len(layout))
for m in re.finditer(r".{0,80}(?:import\(|loadable|constructor|Повод|step).{0,80}", layout):
    s = m.group(0)
    if any(ord(ch) > 127 for ch in s) or "import(" in s or "constructor" in s.lower():
        print(s[:200])

# From CSS class names, guess step labels
css = (root / "dbdbc3398a8f397d.css").read_text(encoding="utf-8", errors="ignore")
labels = sorted(set(re.findall(r"(?:step|wizard|nav)[^\{\}"]{0,40}", css, flags=re.I)))
print("css labels", len(labels))
for x in labels[:50]:
    print(x)

# Search build id and fetch RSC flight for constructor by requesting with draft cookie/hash
html = (root / "meeting.html").read_text(encoding="utf-8", errors="ignore")
# Extract all Cyrillic from HTML properly
phrases = sorted(set(re.findall(r"[А-Яа-яЁёA-Za-z0-9][А-Яа-яЁёA-Za-z0-9 \-«»\"',.!?:;()❤️💌🎬☕]{3,80}", html)))
print("phrases", len(phrases))
for p in phrases:
    if any("\u0400" <= ch <= "\u04FF" for ch in p):
        print(p)
