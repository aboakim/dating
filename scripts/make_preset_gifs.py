from PIL import Image, ImageDraw
from pathlib import Path
import math

out = Path("public/presets")
out.mkdir(parents=True, exist_ok=True)


def save_gif(name, frames, duration=80):
    frames[0].save(
        out / name,
        save_all=True,
        append_images=frames[1:],
        duration=duration,
        loop=0,
        disposal=2,
        optimize=True,
    )
    print(name, (out / name).stat().st_size)


def heart(d, cx, cy, r, fill):
    d.ellipse((cx - r, cy - r - 4, cx, cy + 4), fill=fill)
    d.ellipse((cx, cy - r - 4, cx + r, cy + 4), fill=fill)
    d.polygon([(cx - r - 1, cy), (cx + r + 1, cy), (cx, cy + r + 10)], fill=fill)


W = H = 220

frames = []
for i in range(16):
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    t = abs(i - 8) / 8
    s = 0.72 + 0.28 * (1 - t)
    r = int(48 * s)
    heart(d, W // 2, H // 2 + 8, r, (248, 85, 137, 255))
    for sx, sy in [(40, 40), (180, 50), (50, 170), (170, 160)]:
        a = int(120 + 100 * (1 - t))
        d.ellipse((sx, sy, sx + 8, sy + 8), fill=(255, 182, 193, a))
    frames.append(im.convert("P", palette=Image.ADAPTIVE, colors=64))
save_gif("heart-pulse.gif", frames, 70)

frames = []
for i in range(20):
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    for n, x0, phase, size, col in [
        (0, 50, 0, 18, (248, 85, 137, 255)),
        (1, 110, 7, 26, (255, 120, 160, 255)),
        (2, 160, 3, 16, (255, 90, 140, 255)),
        (3, 80, 12, 14, (255, 160, 190, 255)),
        (4, 145, 15, 20, (240, 70, 120, 255)),
    ]:
        y = H + 20 - ((i * 8 + phase * 10 + n * 20) % (H + 60))
        heart(d, x0, y, size, col)
    frames.append(im.convert("P", palette=Image.ADAPTIVE, colors=64))
save_gif("hearts-rise.gif", frames, 60)

frames = []
for i in range(18):
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    s = 0.85 + 0.15 * math.sin(i / 18 * math.pi * 2)
    cx, cy = W // 2, H // 2
    heart(d, cx, cy, int(36 * s), (255, 105, 150, 255))
    for k in range(6):
        ang = i / 18 * math.pi * 2 + k * math.pi / 3
        rad = 70 + 8 * math.sin(i / 3)
        x = cx + int(math.cos(ang) * rad)
        y = cy + int(math.sin(ang) * rad)
        heart(d, x, y, 10, (255, 170, 200, 230))
    frames.append(im.convert("P", palette=Image.ADAPTIVE, colors=64))
save_gif("love-bloom.gif", frames, 80)

frames = []
for i in range(14):
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    a = int(180 + 75 * math.sin(i / 14 * math.pi * 2))
    d.ellipse((80, 95, 140, 135), fill=(232, 67, 110, a))
    d.ellipse((85, 88, 135, 118), fill=(255, 245, 248, 255))
    d.ellipse((88, 108, 132, 138), fill=(232, 67, 110, a))
    for x, y, ph in [(55, 60, 0), (165, 55, 3), (60, 160, 5), (160, 155, 8)]:
        yy = y + int(6 * math.sin((i + ph) / 3))
        heart(d, x + 10, yy + 6, 10, (255, 120, 160, 220))
    frames.append(im.convert("P", palette=Image.ADAPTIVE, colors=64))
save_gif("kiss-marks.gif", frames, 90)

frames = []
for i in range(16):
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.ellipse((55, 60, 165, 170), fill=(255, 186, 120, 255))
    d.polygon([(60, 90), (70, 40), (100, 75)], fill=(255, 186, 120, 255))
    d.polygon([(160, 90), (150, 40), (120, 75)], fill=(255, 186, 120, 255))
    d.polygon([(68, 88), (74, 52), (95, 78)], fill=(255, 150, 180, 255))
    d.polygon([(152, 88), (146, 52), (125, 78)], fill=(255, 150, 180, 255))
    d.ellipse((80, 100, 100, 120), fill=(60, 40, 40, 255))
    d.ellipse((120, 100, 140, 120), fill=(60, 40, 40, 255))
    d.ellipse((86, 104, 94, 112), fill=(255, 255, 255, 255))
    d.ellipse((126, 104, 134, 112), fill=(255, 255, 255, 255))
    d.ellipse((105, 122, 115, 132), fill=(255, 120, 150, 255))
    d.arc((95, 128, 125, 150), 20, 160, fill=(120, 70, 70, 255), width=2)
    bounce = int(4 * math.sin(i / 16 * math.pi * 2))
    for x, y in [(50, 95 + bounce), (180, 100 - bounce), (110, 45 + bounce)]:
        heart(d, x, y, 12, (248, 85, 137, 255))
    frames.append(im.convert("P", palette=Image.ADAPTIVE, colors=64))
save_gif("cat-love.gif", frames, 80)

frames = []
for i in range(16):
    im = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    cx, cy = W // 2, H // 2
    for k in range(5):
        ang = k * 2 * math.pi / 5 + i / 16 * math.pi / 6
        px = cx + int(math.cos(ang) * 34)
        py = cy + int(math.sin(ang) * 34)
        d.ellipse((px - 18, py - 18, px + 18, py + 18), fill=(255, 180, 200, 240))
    d.ellipse((cx - 16, cy - 16, cx + 16, cy + 16), fill=(255, 120, 160, 255))
    ang = i / 16 * math.pi * 2
    hx = cx + int(math.cos(ang) * 78)
    hy = cy + int(math.sin(ang) * 78)
    heart(d, hx, hy, 10, (248, 85, 137, 255))
    frames.append(im.convert("P", palette=Image.ADAPTIVE, colors=64))
save_gif("blossom-heart.gif", frames, 75)

print("done", [p.name for p in out.glob("*.gif")])
