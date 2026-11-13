import re
import pathlib
import urllib.request

root = pathlib.Path(r"c:\Users\HP\Desktop\teplo\.tmp-onlyteplo")
html = (root / "meeting.html").read_text(encoding="utf-8", errors="ignore")
chunks = sorted(set(re.findall(r"/_next/static/chunks/[^\"']+\.js", html)))
print("html chunks", len(chunks))
for c in chunks:
    print(c)

# Also pull webpack runtime to discover more chunk ids
webpack = urllib.request.urlopen(
    urllib.request.Request(
        "https://onlyteplo.ru/_next/static/chunks/webpack-a964077476d5ab42.js",
        headers={"User-Agent": "Mozilla/5.0"},
    )
).read().decode("utf-8", "ignore")
(root / "webpack.js").write_text(webpack, encoding="utf-8")
# Find map entries mentioning meeting / constructor / step
hits = re.findall(r'"[^"]*(?:meeting|constructor|step|choice|place|кино|кафе)[^"]*"\s*:\s*"?[a-f0-9]+"?', webpack, flags=re.I)
print("webpack hits", len(hits))
for h in hits[:40]:
    print(h)

# Search for Cyrillic in layout chunk already downloaded
for path in root.glob("*.js"):
    text = path.read_text(encoding="utf-8", errors="ignore")
    if re.search(r"Повод|Открытие|Финал|Кино|Кафе|Куда|места", text):
        print("FOUND in", path.name)
        for m in re.finditer(r".{0,40}(?:Повод|Открытие|Финал|Кино|Кафе|Куда|места|Шаг).{0,40}", text):
            print(" ", m.group(0).replace("\n", " ")[:160])
