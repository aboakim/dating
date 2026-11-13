from PIL import Image
from collections import deque
from pathlib import Path

src = Path(r"c:\Users\HP\Desktop\teplo\public\cupid.png")
im = Image.open(src).convert("RGBA")
w, h = im.size
px = im.load()


def dark(r, g, b, a):
    if a < 12:
        return True
    if max(r, g, b) <= 48:
        return True
    # near-black with slight blue cast leftover
    if r <= 55 and g <= 55 and b <= 60 and max(r, g, b) - min(r, g, b) <= 14:
        return True
    return False


q = deque()
seen = [[False] * h for _ in range(w)]
for x in range(w):
    for y in (0, h - 1):
        r, g, b, a = px[x, y]
        if dark(r, g, b, a):
            seen[x][y] = True
            q.append((x, y))
for y in range(h):
    for x in (0, w - 1):
        if seen[x][y]:
            continue
        r, g, b, a = px[x, y]
        if dark(r, g, b, a):
            seen[x][y] = True
            q.append((x, y))

bg = set()
while q:
    x, y = q.popleft()
    bg.add((x, y))
    for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
        if 0 <= nx < w and 0 <= ny < h and not seen[nx][ny]:
            r, g, b, a = px[nx, ny]
            if dark(r, g, b, a):
                seen[nx][ny] = True
                q.append((nx, ny))

# Also clear any thin horizontal black scratches near edges
for y in range(h):
    for x in range(w):
        r, g, b, a = px[x, y]
        if (x, y) in bg:
            continue
        if dark(r, g, b, a) and (y < 18 or y > h - 18 or x < 8 or x > w - 8):
            bg.add((x, y))

out = Image.new("RGBA", (w, h), (0, 0, 0, 0))
op = out.load()
kept = 0
for y in range(h):
    for x in range(w):
        if (x, y) in bg:
            continue
        r, g, b, a = px[x, y]
        op[x, y] = (r, g, b, a if a else 255)
        kept += 1

bbox = out.getbbox()
if bbox:
    pad = 8
    l, t, r, b = bbox
    out = out.crop((max(0, l - pad), max(0, t - pad), min(w, r + pad), min(h, b + pad)))

out.save(src, optimize=True)
print("saved", out.size, "kept", kept, "bg", len(bg), "c", out.getpixel((3, 3)))
