"""Собирает index.html (сервис) и p.html (страница-приглашение по ссылке) из файлов в папке src.
Запуск из корня репозитория:  python3 src/build.py
Нужен только Python 3, без установки пакетов."""
import json, pathlib
src = pathlib.Path(__file__).parent
root = src.parent

def safe(o):
    return json.dumps(o, ensure_ascii=False).replace("<", "\\u003c").replace("\u2028", "\\u2028").replace("\u2029", "\\u2029")

landing = (src / "landing.js").read_text(encoding="utf-8")
assert "</script" not in landing, "в landing.js не должно быть </script"
seed = json.loads((src / "data" / "mikhail-tikhomirov.seed.json").read_text(encoding="utf-8"))
club = json.loads((src / "data" / "club.json").read_text(encoding="utf-8"))
out = ((src / "editor.src.html").read_text(encoding="utf-8")
       .replace("/*@CSS@*/", (src / "editor.css").read_text(encoding="utf-8"))
       .replace("<!--@ICONS@-->", (src / "icons.svg").read_text(encoding="utf-8"))
       .replace("/*@LANDING@*/", landing)
       .replace("/*@SEED@*/", safe(seed))
       .replace("/*@CLUB@*/", safe(club)))
assert "/*@" not in out and "\u2028" not in out
(root / "index.html").write_text(out, encoding="utf-8")
viewer = (src / "viewer.src.html").read_text(encoding="utf-8").replace("/*@LANDING@*/", landing)
assert "/*@" not in viewer
(root / "p.html").write_text(viewer, encoding="utf-8")
print("p.html собран,", len(viewer.encode()) // 1024, "КБ")
print("index.html собран,", len(out.encode()) // 1024, "КБ")
