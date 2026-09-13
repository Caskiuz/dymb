# -*- coding: utf-8 -*-
"""
Optimiza las fotos de images/ a WebP para la web y genera js/manifest.js.

Uso:  python tools/optimize_images.py

- Redimensiona: verticales a max 1080px de ancho, horizontales a max 1600px.
- Convierte a WebP calidad 82 en assets/img/.
- Genera slugs limpios: juntos-20241020-01.webp, solo-20241020-01.webp
- Extrae la fecha del nombre (formato WhatsApp) para la línea del tiempo.
- Genera assets/img/og.jpg (1200x630) desde la primera foto de "juntos"
  para el preview bonito al enviar el link por WhatsApp.
"""
import json
import os
import re
import sys
from datetime import date

from PIL import Image, ImageOps

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "images")
OUT = os.path.join(ROOT, "assets", "img")

MAX_W_VERTICAL = 1080
MAX_W_HORIZONTAL = 1600
QUALITY = 82

DATE_PATTERNS = [
    re.compile(r"IMG-(\d{4})(\d{2})(\d{2})"),                     # IMG-20241020-WA0115.jpg
    re.compile(r"WhatsApp Image (\d{4})-(\d{2})-(\d{2})", re.I),  # WhatsApp Image 2026-09-13 ...
]


def extract_date(name: str):
    for pat in DATE_PATTERNS:
        m = pat.search(name)
        if m:
            y, mo, d = (int(g) for g in m.groups())
            try:
                return date(y, mo, d).isoformat()
            except ValueError:
                return None
    return None


def collect(folder_name: str, prefix: str):
    folder = os.path.join(SRC, folder_name)
    if not os.path.isdir(folder):
        print(f"[aviso] no existe la carpeta {folder}")
        return []
    entries = []
    per_date = {}
    files = sorted(
        f for f in os.listdir(folder)
        if f.lower().endswith((".jpg", ".jpeg", ".png", ".webp"))
    )
    for fname in files:
        src_path = os.path.join(folder, fname)
        fdate = extract_date(fname) or "sin-fecha"
        n = per_date.get(fdate, 0) + 1
        per_date[fdate] = n
        slug = f"{prefix}-{fdate.replace('-', '')}-{n:02d}.webp"
        entries.append({"src": src_path, "slug": slug, "date": fdate, "orig": fname})
    return entries


def collect_all():
    """Escanea todas las subcarpetas de images/ con prefijo = nombre de carpeta."""
    entries = []
    if not os.path.isdir(SRC):
        return entries
    for sub in sorted(os.listdir(SRC)):
        sub_path = os.path.join(SRC, sub)
        if os.path.isdir(sub_path):
            entries.extend(collect(sub, sub.lower().replace(" ", "")))
    return entries


def convert(entry):
    out_path = os.path.join(OUT, entry["slug"])
    with Image.open(entry["src"]) as im:
        im = ImageOps.exif_transpose(im)
        w, h = im.size
        max_w = MAX_W_HORIZONTAL if w >= h else MAX_W_VERTICAL
        if w > max_w:
            im = im.resize((max_w, round(h * max_w / w)), Image.LANCZOS)
        if im.mode not in ("RGB", "L"):
            im = im.convert("RGB")
        im.save(out_path, "WEBP", quality=QUALITY, method=6)
        return im.size


def make_og(entries_juntos):
    if not entries_juntos:
        return False
    src_path = entries_juntos[0]["src"]
    out_path = os.path.join(OUT, "og.jpg")
    target = (1200, 630)
    with Image.open(src_path) as im:
        im = ImageOps.exif_transpose(im).convert("RGB")
        # recorte central a ratio 1200:630 y luego escala
        tw, th = target
        ratio = tw / th
        w, h = im.size
        if w / h > ratio:
            new_w = round(h * ratio)
            box = ((w - new_w) // 2, 0, (w + new_w) // 2, h)
        else:
            new_h = round(w / ratio)
            box = (0, (h - new_h) // 2, w, (h + new_h) // 2)
        im = im.crop(box).resize(target, Image.LANCZOS)
        im.save(out_path, "JPEG", quality=85, optimize=True)
    return True


def main():
    os.makedirs(OUT, exist_ok=True)
    all_entries = collect_all()
    juntos = [e for e in all_entries if "juntos" in e["slug"]] or all_entries

    manifest = []
    total = 0
    for e in all_entries:
        (w, h) = convert(e)
        size = os.path.getsize(os.path.join(OUT, e["slug"]))
        total += size
        manifest.append({
            "src": "assets/img/" + e["slug"],
            "folder": "juntos" if e["slug"].startswith("juntos") else "solo",
            "date": e["date"],
            "w": w,
            "h": h,
            "orig": e["orig"],
        })
        print(f"  {e['slug']}  {w}x{h}  {size/1024:.0f} KB  ({e['date']})")

    # ordenar por fecha (sin fecha al final) y escribir manifest
    manifest.sort(key=lambda m: (m["date"] == "sin-fecha", m["date"]))
    js_path = os.path.join(ROOT, "js", "manifest.js")
    with open(js_path, "w", encoding="utf-8") as f:
        f.write("// Generado por tools/optimize_images.py — no editar a mano.\n")
        f.write("// Fotos optimizadas en orden cronologico (por fecha del nombre de archivo).\n")
        f.write("window.PHOTOS = " + json.dumps(manifest, ensure_ascii=False, indent=2) + ";\n")

    og_ok = make_og(juntos)
    print(f"\n{len(manifest)} fotos optimizadas · {total/1024/1024:.2f} MB en total")
    print(f"manifest -> {js_path}")
    print(f"og.jpg (preview WhatsApp) -> {'OK' if og_ok else 'no generado'}")


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    main()
