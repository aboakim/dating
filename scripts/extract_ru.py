import re
from pathlib import Path

dirp = Path(r"c:\Users\HP\Desktop\teplo\.tmp-onlyteplo")

def decode(t: str) -> str:
    t = re.sub(r"\\u([0-9a-fA-F]{4})", lambda m: chr(int(m.group(1), 16)), t)
    t = t.replace("\\n", " ").replace("\\xab", "«").replace("\\xbb", "»")
    return t

for path in sorted(dirp.glob("*.js")):
    s = path.read_text(encoding="utf-8", errors="ignore")
    out = []
    for m in re.finditer(r'"((?:\\.|[^"\\]){3,200})"', s):
        t = decode(m.group(1))
        if re.search(r"[А-Яа-яЁё]", t) and t not in out:
            out.append(t)
    if not out:
        continue
    print(f"\n===== {path.name} {len(out)} =====")
    # Prefer place/film/step related
    keys = ("Повод", "Открыт", "Вопрос", "Когда", "Выбор", "Финал", "Ссыл", "Шаг", "Кино", "Кафе", "Парк", "Куда", "Мест", "Блюд", "Пицца", "Комедия", "Прогул", "Рестор", "Боулинг", "Музей", "Театр", "Концерт")
    interesting = [t for t in out if any(k.lower() in t.lower() for k in keys)]
    print("-- interesting --")
    for t in interesting[:80]:
        print(t)
    if "5637" in path.name or "5425" in path.name or "2112" in path.name:
        print("-- all first 200 --")
        for t in out[:200]:
            print(t)
