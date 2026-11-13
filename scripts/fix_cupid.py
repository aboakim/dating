from PIL import Image
from collections import deque
from pathlib import Path

src = Path(r"c:\Users\HP\Desktop\teplo\public\cupid.png")
# Prefer the clearer screenshot if available as source salvage
shot = Path(
    r"C:\Users\HP\.cursor\projects\c-Users-HP-Desktop-teplo\assets"
    r"\c__Users_HP_AppData_Roaming_Cursor_User_workspaceStorage_"
    r"f558a39bb6597b7c2357689e8d4f5d39_images_image-aa025406-705a-424f-a61d-59d58e85817e.png"
)

im = Image.open(src).convert("RGBA")
w, h = im.size
px = im.load()


def is_bg(rgb, a):
    r, g, b = rgb
    # already transparent
    if a < 20:
        return True
    # dark near-black bar / studio bg
    if max(r, g, b) <= 55 and abs(r - g) < 12 and abs(g - b) < 12:
        return True
    # leftover light checker / gray fringe
    if max(r, g, b) - min(r, g, b) <= 14 and 180 <= r <= 255:
        return True
    return False


visited = [[False] * h for _ in range(w)]
q = deque()
for x in range(w):
    for y in (0, h - 1):
        r, g, b, a = px[x, y]
        if is_bg((r, g, b), a):
            visited[x][y] = True
            q.append((x, y))
for y in range(h):
    for x in (0, w - 1):
        if visited[x][y]:
            continue
        r, g, b, a = px[x, y]
        if is_bg((r, g, b), a):
            visited[x][y] = True
            q.append((x, y))

bg = set()
while q:
    x, y = q.popleft()
    bg.add((x, y))
    for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
        if 0 <= nx < w and 0 <= ny < h and not visited[nx][ny]:
            r, g, b, a = px[nx, ny]
            if is_bg((r, g, b), a):
                visited[nx][ny] = True
                q.append((nx, ny))

out = Image.new("RGBA", (w, h), (0, 0, 0, 0))
op = out.load()
for y in range(h):
    for x in range(w):
        r, g, b, a = px[x, y]
        if (x, y) in bg:
            continue
        # wipe thin dark top bar leftovers not reached by flood (disconnected)
        if y < 8 and max(r, g, b) <= 70:
            continue
        op[x, y] = (r, g, b, 255 if a > 200 else a)

bbox = out.getbbox()
if bbox:
    pad = 6
    l, t, r, b = bbox
    out = out.crop((max(0, l - pad), max(0, t - pad), min(w, r + pad), min(h, b + pad)))

# Upscale slightly for sharper hero
out = out.resize((out.size[0] * 2, out.size[1] * 2), Image.Resampling.LANCZOS)
out.save(src, optimize=True)
print("saved", src, out.size, "bg", len(bg), "corner", out.getpixel((2, 2)))
