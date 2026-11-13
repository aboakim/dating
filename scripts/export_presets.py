"""Export romantic stickers as high-quality PNG (no GIF palette crushing)."""
from pathlib import Path
from PIL import Image

SRC = Path(r"C:\Users\HP\.cursor\projects\c-Users-HP-Desktop-teplo\assets")
OUT = Path("public/presets")
OUT.mkdir(parents=True, exist_ok=True)

MAPPING = [
    ("preset-cat-heart.jpg", "cat-love.png"),
    ("preset-heart-sparkle.jpg", "heart-pulse.png"),
    ("preset-bears-hug.jpg", "love-bloom.png"),
    ("preset-bunny-rose.jpg", "blossom-heart.png"),
    ("preset-kiss-hearts.jpg", "kiss-marks.png"),
    ("preset-blossom-heart.jpg", "hearts-rise.png"),
]


def main():
    for old in OUT.glob("*"):
        if old.suffix.lower() in {".gif", ".png", ".jpg", ".webp"}:
            old.unlink()
    for src_name, dest_name in MAPPING:
        src = SRC / src_name
        if not src.exists():
            print("missing", src)
            continue
        im = Image.open(src).convert("RGB")
        im = im.resize((420, 420), Image.Resampling.LANCZOS)
        dest = OUT / dest_name
        im.save(dest, format="PNG", optimize=True)
        print(dest.name, dest.stat().st_size)
    print("done", sorted(p.name for p in OUT.iterdir()))


if __name__ == "__main__":
    main()
