import json
import re
import urllib.request
from pathlib import Path

out = Path("public/presets")
out.mkdir(parents=True, exist_ok=True)

queries = [
    ("cat-hearts", "cute cat heart love sticker"),
    ("couple-hug", "cute couple hug heart sticker"),
    ("bear-love", "cute teddy bear love heart"),
    ("kiss-heart", "cute kiss heart animation sticker"),
    ("sparkle-heart", "pink heart sparkle sticker"),
    ("bunny-love", "cute bunny love heart sticker"),
]

# Public beta key historically used for demos; falls back to hard URLs.
GIPHY = "https://api.giphy.com/v1/gifs/search?api_key=dc6zaTOxFJmzC&limit=8&rating=g&q="
TENOR = "https://g.tenor.com/v1/search?key=LIVDSRZULELA&limit=8&media_filter=minimal&q="

# Hand-picked romantic GIF media that are known cute stickers
FALLBACK = [
    ("cat-hearts", "https://media.giphy.com/media/QfbjjvifFnaOgoKqh5/giphy.gif"),
    ("couple-hug", "https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/200.gif"),
    ("bear-love", "https://media.tenor.com/YgCqFQyWOqIAAAAC/love-bear.gif"),
    ("kiss-heart", "https://media.tenor.com/sH6L1oH7r5cAAAAC/heart-love.gif"),
    ("sparkle-heart", "https://media.tenor.com/0A8yQRU7rjQAAAAC/heart-pink.gif"),
    ("bunny-love", "https://media.tenor.com/2s5Q4Y2kQ2YAAAAC/love-hearts.gif"),
]


def download(url: str, dest: Path) -> bool:
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = resp.read()
        if len(data) < 2000:
            return False
        # reject obvious HTML error pages
        if data[:15].lower().startswith(b"<!doctype") or data[:5] == b"<html":
            return False
        dest.write_bytes(data)
        print("ok", dest.name, len(data), url[:80])
        return True
    except Exception as exc:
        print("fail", dest.name, exc)
        return False


def pick_from_giphy(q: str) -> str | None:
    try:
        with urllib.request.urlopen(GIPHY + urllib.parse.quote(q), timeout=20) as resp:
            payload = json.loads(resp.read().decode("utf-8"))
        for item in payload.get("data", []):
            title = (item.get("title") or "").lower()
            url = (
                item.get("images", {}).get("fixed_height", {}).get("url")
                or item.get("images", {}).get("downsized", {}).get("url")
                or item.get("images", {}).get("original", {}).get("url")
            )
            if not url:
                continue
            # Prefer sticker-like soft romantic results
            if any(bad in title for bad in ("spongebob", "office", "meme", "celebrate", "chuck")):
                continue
            return url
    except Exception as exc:
        print("giphy search fail", q, exc)
    return None


import urllib.parse

kept = []
for name, query in queries:
    dest = out / f"{name}.gif"
    url = pick_from_giphy(query)
    if url and download(url, dest):
        kept.append(name)
        continue
    # fallback list
    fb = next((u for n, u in FALLBACK if n == name), None)
    if fb and download(fb, dest):
        kept.append(name)

print("kept", kept)
print("files", sorted(p.name for p in out.glob("*.gif") if not p.name.startswith("_try")))
