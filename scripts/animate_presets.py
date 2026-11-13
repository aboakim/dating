"""Turn generated romantic stickers into soft looping GIFs."""
from pathlib import Path
import math
from PIL import Image, ImageDraw, ImageEnhance

SRC = Path(r"C:\Users\HP\.cursor\projects\c-Users-HP-Desktop-teplo\assets")
OUT = Path("public/presets")
OUT.mkdir(parents=True, exist_ok=True)

MAPPING = [
    ("preset-cat-heart.jpg", "cat-love.gif"),
    ("preset-heart-sparkle.jpg", "heart-pulse.gif"),
    ("preset-bears-hug.jpg", "love-bloom.gif"),
    ("preset-bunny-rose.jpg", "blossom-heart.gif"),
    ("preset-kiss-hearts.jpg", "kiss-marks.gif"),
    ("preset-blossom-heart.jpg", "hearts-rise.gif"),
]


def heart(draw, cx, cy, r, fill):
    draw.ellipse((cx - r, cy - r - 3, cx, cy + 3), fill=fill)
    draw.ellipse((cx, cy - r - 3, cx + r, cy + 3), fill=fill)
    draw.polygon([(cx - r - 1, cy), (cx + r + 1, cy), (cx, cy + r + 8)], fill=fill)


def animate(src_path: Path, dest_name: str, frames=12):
    base = Image.open(src_path).convert("RGBA")
    # Crop a bit of margin and normalize size
    w = h = 320
    base = base.resize((w, h), Image.Resampling.LANCZOS)
    frames_out = []
    for i in range(frames):
        t = i / frames
        scale = 0.96 + 0.04 * math.sin(t * math.pi * 2)
        sw = int(w * scale)
        sh = int(h * scale)
        scaled = base.resize((sw, sh), Image.Resampling.LANCZOS)
        canvas = Image.new("RGBA", (w, h), (255, 245, 248, 0))
        canvas.paste(scaled, ((w - sw) // 2, (h - sh) // 2), scaled)
        # floating mini hearts / sparkles
        overlay = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        d = ImageDraw.Draw(overlay)
        for n, (x0, y0, size, phase) in enumerate(
            [
                (48, 70, 9, 0.0),
                (270, 90, 11, 0.3),
                (60, 250, 8, 0.6),
                (255, 240, 10, 0.8),
                (160, 36, 7, 0.15),
            ]
        ):
            bob = int(10 * math.sin((t + phase) * math.pi * 2))
            alpha = int(150 + 80 * math.sin((t + phase) * math.pi * 2))
            heart(d, x0, y0 + bob, size, (248, 85, 137, max(40, alpha)))
            # sparkle dots
            sx = x0 + 18
            sy = y0 - 12 + bob
            d.ellipse((sx, sy, sx + 4, sy + 4), fill=(255, 200, 220, alpha))
        canvas = Image.alpha_composite(canvas, overlay)
        # slight brightness pulse
        bright = ImageEnhance.Brightness(canvas).enhance(1.0 + 0.04 * math.sin(t * math.pi * 2))
        frames_out.append(bright.convert("P", palette=Image.ADAPTIVE, colors=192))

    dest = OUT / dest_name
    frames_out[0].save(
        dest,
        save_all=True,
        append_images=frames_out[1:],
        duration=90,
        loop=0,
        disposal=2,
        optimize=True,
    )
    print(dest.name, dest.stat().st_size)


def main():
    # clear old crude presets
    for old in OUT.glob("*.gif"):
        old.unlink()
    for src_name, dest_name in MAPPING:
        src = SRC / src_name
        if not src.exists():
            print("missing", src)
            continue
        animate(src, dest_name)
    print("done", sorted(p.name for p in OUT.glob("*.gif")))


if __name__ == "__main__":
    main()
