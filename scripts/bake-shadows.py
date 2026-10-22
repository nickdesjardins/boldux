# -*- coding: utf-8 -*-
"""
Bakes a soft drop shadow into the transparent product cut-outs under public/img so the site
needs no CSS `filter: drop-shadow` (dozens of filter layers made scrolling stutter).

Idempotent: processed files are recorded in src/data/shadows.json and skipped next time.
Updates the width/height in src/data/assets.json for every image it changes.

Run from the website folder:  python -X utf8 scripts/bake-shadows.py
"""
import glob
import json
import os

from PIL import Image, ImageFilter

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
IMG = os.path.join(ROOT, "public", "img")
MANIFEST = os.path.join(ROOT, "src", "data", "assets.json")
MARKER = os.path.join(ROOT, "src", "data", "shadows.json")

# Garment / product cut-outs only. Artwork scans (art-*.webp, prints) sit on paper tiles,
# photos have no alpha, brand files and the hero are untouched.
PATTERNS = ["models/**/*.webp", "portfolio/**/*.webp", "collections/*/tee-*.webp", "collections/*/hoodie-*.webp"]


def bake(path):
    im = Image.open(path)
    if im.mode != "RGBA":
        return None
    w, h = im.size
    pad = max(24, int(w * 0.05))
    blur = max(10, int(w * 0.035))
    off_y = max(8, int(w * 0.025))
    canvas = Image.new("RGBA", (w + 2 * pad, h + 2 * pad), (0, 0, 0, 0))
    alpha = im.getchannel("A")
    shadow = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    sh_alpha = Image.new("L", canvas.size, 0)
    sh_alpha.paste(alpha, (pad, pad + off_y))
    sh_alpha = sh_alpha.filter(ImageFilter.GaussianBlur(blur)).point(lambda v: int(v * 0.55))
    shadow.putalpha(sh_alpha)
    canvas.alpha_composite(shadow)
    canvas.alpha_composite(im, (pad, pad))
    canvas.save(path, "WEBP", quality=84, method=6)
    return canvas.size


def main():
    done = set(json.load(open(MARKER, encoding="utf-8"))) if os.path.exists(MARKER) else set()
    manifest = json.load(open(MANIFEST, encoding="utf-8"))
    sizes = manifest.setdefault("sizes", {})
    files = []
    for pat in PATTERNS:
        files += glob.glob(os.path.join(IMG, pat), recursive=True)
    files = sorted(set(files))
    n = 0
    for f in files:
        rel = "/img/" + os.path.relpath(f, IMG).replace(os.sep, "/")
        if rel in done:
            continue
        size = bake(f)
        if size is None:
            continue
        sizes[rel] = {"w": size[0], "h": size[1]}
        done.add(rel)
        n += 1
        print("  shadow ->", rel, size)
    json.dump(manifest, open(MANIFEST, "w", encoding="utf-8"), indent=1, ensure_ascii=False)
    json.dump(sorted(done), open(MARKER, "w", encoding="utf-8"), indent=1)
    print("DONE", n, "images shadowed;", len(done), "total recorded")


if __name__ == "__main__":
    main()
