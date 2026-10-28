# -*- coding: utf-8 -*-
"""
Boldux website asset pipeline.

Reads source artwork from the Boldux project folders, cuts images out of the mockup
decks, removes backgrounds where needed (rembg) and writes optimized WebP files into
public/img. It also writes src/data/assets.json (what the site reads) and
IMAGES-TO-REPLACE.json (images worth swapping for cleaner originals later).

Run from the website folder:
    python -X utf8 scripts/prepare-assets.py            # skips files already generated
    python -X utf8 scripts/prepare-assets.py --force    # regenerates everything
"""
import io
import json
import os
import sys

import numpy as np
from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
BOLDUX = os.path.abspath(os.path.join(ROOT, ".."))  # ...\Projects\Boldux
OUT = os.path.join(ROOT, "public", "img")
FORCE = "--force" in sys.argv
MANIFEST = []
REPLACE_LIST = []


def P(*parts):
    return os.path.join(BOLDUX, *parts)


# ---------- helpers ----------
_session = None


def rembg_remove(im):
    global _session
    from rembg import new_session, remove

    if _session is None:
        _session = new_session("isnet-general-use")
    return remove(im, session=_session)


def has_real_alpha(im):
    if im.mode != "RGBA":
        return False
    a = np.array(im.getchannel("A"))
    return (a < 250).mean() > 0.03


def trim_alpha(im, pad=0.02):
    bb = im.getchannel("A").point(lambda v: 255 if v > 6 else 0).getbbox()
    if not bb:
        return im
    w, h = im.size
    px, py = int(w * pad), int(h * pad)
    bb = (max(0, bb[0] - px), max(0, bb[1] - py), min(w, bb[2] + px), min(h, bb[3] + py))
    return im.crop(bb)


def unblend_black(im, floor=12):
    """Logo on pure black -> transparent (alpha from luminance, colour un-premultiplied)."""
    a = np.array(im.convert("RGB")).astype(np.float32)
    mx = a.max(axis=2)
    alpha = np.clip((mx - floor) / (255 - floor), 0, 1)
    rgb = np.where(alpha[..., None] > 0, np.clip(a / np.maximum(alpha[..., None], 1e-3), 0, 255), 0)
    return Image.fromarray(np.dstack([rgb, alpha * 255]).astype(np.uint8), "RGBA")


_pdf_cache = {}


def pdf_image(pdf, page, idx):
    """Extract embedded image idx from page of pdf, honouring soft masks."""
    import pymupdf

    if pdf not in _pdf_cache:
        _pdf_cache[pdf] = pymupdf.open(pdf)
    d = _pdf_cache[pdf]
    imgs = d[page].get_images(full=True)
    xref, smask = imgs[idx][0], imgs[idx][1]
    pix = pymupdf.Pixmap(d, xref)
    if pix.n - pix.alpha >= 4:
        pix = pymupdf.Pixmap(pymupdf.csRGB, pix)
    if smask:
        mask = pymupdf.Pixmap(d, smask)
        pix = pymupdf.Pixmap(pix, mask)
    return Image.open(io.BytesIO(pix.tobytes("png")))


def public_path(rel):
    return "/img/" + rel.replace("\\", "/")


def exists(rel):
    return (not FORCE) and os.path.exists(os.path.join(OUT, rel))


def record(rel, im=None, note=None):
    dst = os.path.join(OUT, rel)
    if im is None:
        im = Image.open(dst)
    MANIFEST.append({"file": public_path(rel), "w": im.size[0], "h": im.size[1], "alpha": im.mode == "RGBA"})
    if note:
        REPLACE_LIST.append({"file": public_path(rel), "note": note})
    return public_path(rel)


def save(im, rel, max_side=1600, quality=84, fmt="webp", note=None):
    """Resize + save. Returns public path."""
    if exists(rel):
        return record(rel, note=note)
    dst = os.path.join(OUT, rel)
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    if im.mode not in ("RGB", "RGBA"):
        im = im.convert("RGBA")
    w, h = im.size
    s = min(1.0, max_side / max(w, h))
    if s < 1:
        im = im.resize((round(w * s), round(h * s)), Image.LANCZOS)
    if fmt == "webp":
        im.save(dst, "WEBP", quality=quality, method=6)
    elif fmt == "png":
        im.save(dst, "PNG", optimize=True)
    else:
        im.convert("RGB").save(dst, "JPEG", quality=quality, optimize=True, progressive=True)
    print("  ->", rel, im.size)
    return record(rel, im, note)


def cutout(im, rel):
    """Return RGBA with background removed (uses existing alpha if present)."""
    im = im.convert("RGBA")
    if has_real_alpha(im):
        return trim_alpha(im)
    big = im.copy()
    big.thumbnail((1800, 1800))
    out = rembg_remove(big)
    REPLACE_LIST.append(
        {
            "file": public_path(rel),
            "note": "Background removed automatically (AI cut-out). Replace with an original PNG with transparency if you have one.",
        }
    )
    return trim_alpha(out)


def product(src, rel, max_side=1600, crop_top=0.0):
    if exists(rel):
        return record(rel)
    print(src if isinstance(src, str) else "<pdf image>")
    im = Image.open(src) if isinstance(src, str) else src
    if crop_top:
        w, h = im.size
        im = im.crop((0, int(h * crop_top), w, h))
    im = cutout(im, rel)
    return save(im, rel, max_side=max_side)


def deck(pdf, page, idx, rel, max_side=1600, crop_top=0.0):
    if exists(rel):
        return record(rel)
    return product(pdf_image(pdf, page, idx), rel, max_side=max_side, crop_top=crop_top)


# ---------- 1. Brand ----------
print("== brand")
logo = Image.open(os.path.join(ROOT, "images", "logo.png"))
logo_t = trim_alpha(unblend_black(logo), pad=0.01)
save(
    logo_t,
    "brand/logo.png",
    max_side=1400,
    fmt="png",
    note="Logo cut from a black-background PNG. Replace with the vector/transparent original for perfectly crisp edges.",
)
# emblem / wordmark split: find the horizontal gap between the B emblem and the wordmark
a = np.array(logo_t.getchannel("A"))
rows = (a > 10).sum(axis=1)
h = len(rows)
best, cur, start = (0, 0, 0), 0, 0
for y in range(int(h * 0.4), int(h * 0.8)):
    if rows[y] < 3:
        if cur == 0:
            start = y
        cur += 1
        if cur > best[0]:
            best = (cur, start, y)
    else:
        cur = 0
gap_mid = (best[1] + best[2]) // 2 if best[0] > 0 else int(h * 0.62)
emblem = trim_alpha(logo_t.crop((0, 0, logo_t.width, gap_mid)), pad=0.02)
wordmark = trim_alpha(logo_t.crop((0, gap_mid, logo_t.width, logo_t.height)), pad=0.02)
save(emblem, "brand/logo-emblem.png", max_side=800, fmt="png")
save(wordmark, "brand/logo-wordmark.png", max_side=1400, fmt="png")
# favicon / apple icon
fav = Image.new("RGBA", (512, 512), (7, 7, 10, 255))
e = emblem.copy()
e.thumbnail((400, 400))
fav.alpha_composite(e, ((512 - e.width) // 2, (512 - e.height) // 2))
fav.save(os.path.join(ROOT, "src", "app", "icon.png"))
fav.resize((180, 180), Image.LANCZOS).save(os.path.join(ROOT, "src", "app", "apple-icon.png"))
# legacy eye logo for the "art" story
old = Image.open(P("boldux", "whiteBoldux.png")).convert("RGBA")
save(trim_alpha(old), "brand/logo-legacy-white.png", max_side=1200, fmt="png")
oldred = Image.open(P("PRODUCTION", "Logo boldux", "Official Logo.png")).convert("RGBA")
save(trim_alpha(oldred), "brand/logo-legacy-red.png", max_side=1200, fmt="png")
eye = Image.open(P("boldux", "redeye.png")).convert("RGBA")
save(trim_alpha(eye), "brand/eye-red.png", max_side=600, fmt="png")
eyew = Image.open(P("boldux", "whiteeye.png")).convert("RGBA")
save(trim_alpha(eyew), "brand/eye-white.png", max_side=600, fmt="png")

# ---------- 2. Hero ----------
print("== hero")
hero = Image.open(os.path.join(ROOT, "images", "hero.png")).convert("RGB")
save(
    hero.crop((540, 0, 1536, 838)),
    "hero/studio.webp",
    max_side=1600,
    quality=86,
    note="Right-hand crop of the hero concept image (baked-in text removed by cropping). Replace with a higher-resolution studio photo without text if you make one.",
)
save(hero, "hero/concept-full.webp", max_side=1600, quality=84)
save(hero.crop((300, 0, 1536, 838)), "hero/studio-wide.webp", max_side=1600, quality=84)
try:
    port = Image.open(P("d1dbc485-91d3-498b-993b-07d4c55dd99c.jpg")).convert("RGB")
    save(
        port,
        "art/artist.webp",
        max_side=1200,
        quality=84,
        note="Photo of Stéphane found in the Boldux folder; replace with a proper portrait if preferred.",
    )
except Exception as ex:
    print("portrait skipped", ex)

# ---------- 3. Collections (Boldux art on garments) ----------
print("== collections")
COLL = {
    "music": (
        "PRODUCTION/The Music",
        "MUSIC",
        {"TS": ["BLACK-RED", "BLACK-WHITE", "BLUE-WHITE", "GREY-BLACK", "RED-WHITE"], "V": ["BLACK-RED", "BLACK-WHITE", "RED-WHITE"]},
    ),
    "skulls": (
        "PRODUCTION/The Skulls",
        "SKULL-1",
        {"TS": ["BLACK-RED", "BLACK-WHITE", "GREY-BLACK", "RED-BLACK"], "V": ["BLACK-RED", "WHITE-BLACK", "WHITE-RED"]},
    ),
    "warrior": (
        "PRODUCTION/The Warrior",
        "WARRIOR",
        {"TS": ["BLACK-RED", "BLACK-WHITE", "ORANGE-BLACK", "RED-WHITE", "WHITE-RED"], "V": ["BLACK-RED", "WHITE-BLACK", "WHITE-RED"]},
    ),
}
coll_manifest = {}
for slug, (folder, prefix, kinds) in COLL.items():
    coll_manifest[slug] = {"tee": {}, "hoodie": {}}
    for kind, cws in kinds.items():
        key = "tee" if kind == "TS" else "hoodie"
        for cw in cws:
            base = P(folder, f"{prefix}-{kind}-{cw}")
            combo = base + ".png"
            if not os.path.exists(combo) and os.path.exists(base + "png.png"):
                combo = base + "png.png"
            entry = {}
            for suffix, name in [("", "duo"), ("-front", "front"), ("-back", "back")]:
                src = combo if suffix == "" else base + suffix + ".png"
                rel = f"collections/{slug}/{key}-{cw.lower()}{suffix or '-duo'}.webp"
                if exists(rel):
                    entry[name] = record(rel)
                elif os.path.exists(src):
                    im = trim_alpha(Image.open(src).convert("RGBA"))
                    entry[name] = save(im, rel, max_side=1600 if name == "duo" else 1400)
            coll_manifest[slug][key][cw.lower()] = entry
ART = {
    "music": [("PRODUCTION/The Music/166546_Stephane Bolduc_SCAN-1.png", "art-music.webp")],
    "skulls": [
        ("PRODUCTION/The Skulls/153070_S-Bolduc-1-26x40_ROUGE.png", "art-skull-1-red.webp"),
        ("PRODUCTION/The Skulls/153070_S-Bolduc-1-26x40_BLEU.png", "art-skull-1-blue.webp"),
        ("PRODUCTION/The Skulls/S-Bolduc-1-26x40_NOIR.png", "art-skull-1-black.webp"),
        ("PRODUCTION/The Skulls/153070_S-Bolduc-2-26x40_ROUGE.png", "art-skull-2-red.webp"),
        ("PRODUCTION/The Skulls/153070_S-Bolduc-2-26x40_BLEU.png", "art-skull-2-blue.webp"),
        ("PRODUCTION/The Skulls/S-Bolduc-2-26x40_NOIR.png", "art-skull-2-black.webp"),
    ],
    "warrior": [
        ("PRODUCTION/The Warrior/146418_BOLDUX_Scan-3_Rouge.png", "art-warrior-red.webp"),
        ("PRODUCTION/The Warrior/146418_BOLDUX_Scan-3_Bleu.png", "art-warrior-blue.webp"),
        ("PRODUCTION/The Warrior/164521_Stephane Bolduc_1_SCAN.png", "art-warrior-black.webp"),
    ],
}
for slug, items in ART.items():
    coll_manifest[slug]["art"] = []
    for src, name in items:
        rel = f"collections/{slug}/{name}"
        if exists(rel):
            coll_manifest[slug]["art"].append(record(rel))
            continue
        im = trim_alpha(Image.open(P(src)).convert("RGBA"), pad=0.03)
        coll_manifest[slug]["art"].append(save(im, rel, max_side=1400))

# ---------- 4. Catalog decks (models) ----------
print("== models from PDF decks")
V3 = P("PRODUCTION", "Mockups", "Boldux_Mockups v3 (1).pdf")
V1 = P("PRODUCTION", "Mockups", "Boldux_Mockups.pdf")
JUN5 = P("PRODUCTION", "Mockups", "Stephane_Boldux_-_Mockups_-_5_june_2024.pdf")
JUL22 = P("PRODUCTION", "Mockups", "Stephane_Boldux_-_Mockups_-_22_July_2024.pdf")
CLIENT = os.path.join(ROOT, "images", "Mockups.pdf")

models = {
    k: []
    for k in [
        "hoodies",
        "tshirts",
        "long-sleeves",
        "caps",
        "beanies",
        "joggers",
        "jackets",
        "sweatshirts",
        "shorts",
        "rashguards",
        "tracksuits",
        "accessories",
    ]
}
# hoodies (zip) - Boldux signature / eye
for i, pg in enumerate([0, 1, 2, 3, 4]):
    models["hoodies"].append(deck(V3, pg, 0, f"models/hoodies/zip-signature-{i + 1}.webp"))
models["hoodies"].append(deck(V3, 3, 1, "models/hoodies/zip-eye-back-white.webp", 1400))
models["hoodies"].append(deck(V3, 4, 1, "models/hoodies/zip-eye-back-red.webp", 1400))
models["hoodies"].append(deck(V3, 27, 0, "models/hoodies/zip-aerial-white.webp"))
models["hoodies"].append(deck(V3, 28, 0, "models/hoodies/zip-aerial-yellow.webp"))
# art hoodies from the June 2024 deck (page -> image index; page 12 stores the hoodie first)
# pages 8-10 repeat the previous tee images first; the hoodie is the last (smaller) image on those pages
for i, (pg, idx) in enumerate([(8, 3), (9, 3), (10, 2), (11, 1), (12, 0), (13, 1), (14, 1), (15, 1), (16, 1)]):
    models["hoodies"].append(deck(JUN5, pg, idx, f"models/hoodies/zip-art-{i + 1}.webp"))
# t-shirts
for i, pg in enumerate([11, 12, 13, 14, 15, 16, 17]):
    models["tshirts"].append(deck(V3, pg, 0, f"models/tshirts/tee-signature-{i + 1}.webp"))
for i, pg in enumerate([29, 30, 31]):
    models["tshirts"].append(deck(V3, pg, 0, f"models/tshirts/tee-aerial-{i + 1}.webp"))
for i, pg in enumerate([0, 1, 2, 3, 4, 5]):
    models["tshirts"].append(deck(JUL22, pg, 0, f"models/tshirts/tee-art-{i + 1}.webp"))
# caps
for i, pg in enumerate([5, 6, 7]):
    models["caps"].append(deck(V3, pg, 0, f"models/caps/snapback-{i + 1}.webp", 1200))
for i, pg in enumerate([4, 5]):
    models["caps"].append(deck(V1, pg, 0, f"models/caps/curved-{i + 1}.webp", 1200))
# joggers
for i, pg in enumerate([8, 9, 10]):
    models["joggers"].append(deck(V3, pg, 0, f"models/joggers/jogger-signature-{i + 1}-front.webp", 1400))
    models["joggers"].append(deck(V3, pg, 1, f"models/joggers/jogger-signature-{i + 1}-back.webp", 1400))
for i, pg in enumerate([34, 35, 36]):
    models["joggers"].append(deck(V3, pg, 0, f"models/joggers/jogger-aerial-{i + 1}.webp", 1400))
# jackets
for i, pg in enumerate([18, 19, 20, 21, 22]):
    models["jackets"].append(deck(V3, pg, 0, f"models/jackets/jacket-signature-{i + 1}.webp", 1400))
for i, (pg, idx) in enumerate([(32, 0), (32, 1), (33, 0), (33, 1)]):
    models["jackets"].append(deck(V3, pg, idx, f"models/jackets/windbreaker-{i + 1}.webp", 1400))
# sweatshirts
models["sweatshirts"].append(deck(V3, 23, 0, "models/sweatshirts/crew-skull-grey.webp"))
models["sweatshirts"].append(deck(V3, 24, 0, "models/sweatshirts/crew-skull-red.webp"))
models["sweatshirts"].append(deck(V1, 18, 0, "models/sweatshirts/crew-wordmark.webp"))
# shorts
for i in range(5):
    models["shorts"].append(deck(V3, 25, i, f"models/shorts/short-{i + 1}.webp", 1000))
# rash guards / swim
for i in range(3):
    models["rashguards"].append(deck(V3, 26, i, f"models/rashguards/rashguard-{i + 1}.webp", 1400))
# tracksuits
for i, pg in enumerate([20, 21, 22, 23]):
    models["tracksuits"].append(deck(V1, pg, 0, f"models/tracksuits/tracksuit-{i + 1}.webp", 1400))
# long sleeves
models["long-sleeves"].append(deck(CLIENT, 11, 0, "models/long-sleeves/long-sleeve-white.webp"))
models["long-sleeves"].append(deck(CLIENT, 1, 0, "models/long-sleeves/long-sleeve-grey.webp"))
models["long-sleeves"].append(product(P("A.R.S", "longsleve-front.png"), "models/long-sleeves/long-sleeve-grey-front.webp", 1200))
models["long-sleeves"].append(product(P("A.R.S", "longsleve-back.png"), "models/long-sleeves/long-sleeve-grey-back.webp", 1200))
# beanies
for c in ["beige", "black", "red"]:
    models["beanies"].append(product(P("Arctic Sealift", f"tuque-{c}.png"), f"models/beanies/beanie-{c}.webp", 900))
models["beanies"].append(product(P("Arctic Sealift", "beenes.png"), "models/beanies/beanies-duo.webp", 1000))
# accessories
# Preserve the product images extracted from the supplied Chartwell PDF.
for name in ["chartwell-travel-mug", "chartwell-mug"]:
    rel = f"models/accessories/{name}.webp"
    if os.path.exists(os.path.join(OUT, rel)):
        models["accessories"].append(record(rel))
models["accessories"].append(product(P("Arctic Sealift", "mug-nobg.png"), "models/accessories/mug.webp", 1200))
rel = "models/accessories/mug-photo.webp"
if exists(rel):
    models["accessories"].append(record(rel))
else:
    im = Image.open(P("Arctic Sealift", "Tasse Artic Sealift.jpg")).convert("RGB")
    models["accessories"].append(save(im, rel, max_side=1200, quality=84))

# ---------- 5. Portfolio (client work; companies are NOT named on the site) ----------
print("== portfolio")
portfolio = {}
portfolio["industrial"] = [
    product(P("A.R.S", "hoody-hero.png"), "portfolio/industrial/hero.webp", 1400),
    product(P("A.R.S", "hoody.png"), "portfolio/industrial/hoodie-duo.webp", 1400),
    product(P("A.R.S", "hoody-front.png"), "portfolio/industrial/hoodie-front.webp", 1200),
    product(P("A.R.S", "hoody-back.png"), "portfolio/industrial/hoodie-back.webp", 1200),
    product(P("A.R.S", "longsleve.png"), "portfolio/industrial/long-sleeve-duo.webp", 1400),
    product(P("A.R.S", "Tshirt.png"), "portfolio/industrial/tee-duo.webp", 1400),
    product(P("A.R.S", "Tshirt-back.png"), "portfolio/industrial/tee-back.webp", 1200),
]
portfolio["northern"] = [
    product(P("Arctic Sealift", "artic-mix.png"), "portfolio/northern/mix.webp", 1200),
    product(P("Arctic Sealift", "cotton_outee-ice.png"), "portfolio/northern/hoodie-ice-duo.webp", 1400),
    product(P("Arctic Sealift", "cotton_outee-ice-front.png"), "portfolio/northern/hoodie-ice-front.webp", 1000),
    product(P("Arctic Sealift", "cotton_outee-ice-back.png"), "portfolio/northern/hoodie-ice-back.webp", 1000),
    product(P("Arctic Sealift", "outee-rouge.png"), "portfolio/northern/hoodie-red-duo.webp", 1400),
    product(P("Arctic Sealift", "outee-rouge-face.png"), "portfolio/northern/hoodie-red-front.webp", 1000),
    product(P("Arctic Sealift", "cotton_outee.png"), "portfolio/northern/hoodie-fade-duo.webp", 1400),
    deck(CLIENT, 3, 0, "portfolio/northern/hoodie-red-stripes.webp", 1200, crop_top=0.13),
    deck(CLIENT, 4, 0, "portfolio/northern/hoodie-camo.webp", 1200, crop_top=0.13),
    deck(CLIENT, 5, 0, "portfolio/northern/hoodie-fade.webp", 1200, crop_top=0.13),
    deck(CLIENT, 3, 1, "portfolio/northern/cap-navy.webp", 1000),
    deck(CLIENT, 4, 1, "portfolio/northern/cap-red.webp", 1000),
    deck(CLIENT, 5, 1, "portfolio/northern/cap-blue.webp", 1000),
    "/img/models/beanies/beanies-duo.webp",
    "/img/models/accessories/mug.webp",
]
portfolio["residence"] = [
    deck(CLIENT, 6, 0, "portfolio/residence/hoodie-burgundy.webp", 1200),
    deck(CLIENT, 7, 0, "portfolio/residence/tee-black.webp", 1200),
    deck(CLIENT, 8, 0, "portfolio/residence/tee-sport.webp", 1200),
]
portfolio["farm"] = [deck(CLIENT, 9, 0, "portfolio/farm/hoodie-grey.webp", 1200)]
portfolio["team"] = [deck(CLIENT, 10, 0, "portfolio/team/hoodie-blue.webp", 1200)]
REPLACE_LIST.append(
    {
        "file": "/img/portfolio/residence/*",
        "note": "The client name is printed on the garments in these deck images. The website text never names the client, but the photos do. Swap for neutral shots if needed.",
    }
)
REPLACE_LIST.append({"file": "/img/portfolio/industrial/*", "note": "Client initials appear on the garments; the website text never names the client."})
REPLACE_LIST.append({"file": "/img/portfolio/farm/*", "note": "Client name appears on the hoodie; the website text never names the client."})

# ---------- 6. Aerial collection (wave designs + inspiration photos) ----------
print("== aerial")
aerial = {
    "garments": [
        "/img/models/hoodies/zip-aerial-white.webp",
        "/img/models/hoodies/zip-aerial-yellow.webp",
        "/img/models/tshirts/tee-aerial-1.webp",
        "/img/models/tshirts/tee-aerial-2.webp",
        "/img/models/tshirts/tee-aerial-3.webp",
        "/img/models/jackets/windbreaker-1.webp",
        "/img/models/jackets/windbreaker-3.webp",
        "/img/models/joggers/jogger-aerial-1.webp",
        "/img/models/joggers/jogger-aerial-2.webp",
    ],
    "inspiration": [],
}
for n in ["desert", "forest", "islands", "ocean", "snow", "volcano"]:
    rel = f"collections/aerial/{n}.webp"
    if exists(rel):
        aerial["inspiration"].append(record(rel))
        continue
    im = Image.open(P("Aerial fill", f"{n}.jpg")).convert("RGB")
    aerial["inspiration"].append(save(im, rel, max_side=1200, quality=84))

# ---------- 7. Prints (art scans) ----------
print("== prints")
prints = []
SCANS = [
    ("Scans PNG/BOLDUX_Scan-1_Rouge.png", "scan-1-red"),
    ("Scans PNG/BOLDUX_Scan-1_Bleu.png", "scan-1-blue"),
    ("Scans PNG/BOLDUX_Scan-1_Noir.png", "scan-1-black"),
    ("Scans PNG/BOLDUX_Scan-2_Rouge.png", "scan-2-red"),
    ("Scans PNG/BOLDUX_Scan-2_Bleu.png", "scan-2-blue"),
    ("Scans PNG/BOLDUX_Scan-2_Noir.png", "scan-2-black"),
    ("Scans PNG/BOLDUX_Scan-4_Rouge.png", "scan-4-red"),
    ("Scans PNG/BOLDUX_Scan-4_Bleu.png", "scan-4-blue"),
    ("Scans PNG/BOLDUX_Scan-4_Noir.png", "scan-4-black"),
    ("Scans PNG/S-Bolduc-1-26x40_ROUGE.png", "series-1-red"),
    ("Scans PNG/S-Bolduc-1-26x40_BLEU.png", "series-1-blue"),
    ("Scans PNG/S-Bolduc-1-26x40_NOIR.png", "series-1-black"),
    ("Scans PNG/S-Bolduc-1-26x40-Blanc.png", "series-1-white"),
    ("Scans PNG/S-Bolduc-3-26x40_ROUGE.png", "series-3-red"),
    ("Scans PNG/S-Bolduc-3-26x40_BLEU.png", "series-3-blue"),
    ("Scans PNG/S-Bolduc-3-26x40_NOIR.png", "series-3-black"),
    ("Scans PNG/S-Bolduc-3-26x40_Green.png", "series-3-green"),
    ("Scans PNG/S-Bolduc-3-26x40_Blanc.png", "series-3-white"),
    ("Scans PNG/S-Bolduc-2-26x40_whiteyellow.png", "series-2-white-yellow"),
]
for src, name in SCANS:
    rel = f"prints/{name}.webp"
    if exists(rel):
        prints.append(record(rel))
        continue
    try:
        im = Image.open(P(src)).convert("RGBA")
        prints.append(save(trim_alpha(im, 0.03), rel, max_side=1400))
    except Exception as ex:
        print("print skipped", src, ex)
pun = Image.open(P("mISC", "skull pun.png")).convert("RGBA")
save(trim_alpha(pun), "art/skull-pun.png", max_side=1600, fmt="png")

# ---------- 8. Signature "eye" collection ----------
eye = [
    "/img/models/hoodies/zip-signature-1.webp",
    "/img/models/hoodies/zip-signature-3.webp",
    "/img/models/hoodies/zip-eye-back-red.webp",
    "/img/models/tshirts/tee-signature-1.webp",
    "/img/models/tshirts/tee-signature-2.webp",
    "/img/models/caps/snapback-1.webp",
    "/img/models/joggers/jogger-signature-1-front.webp",
    "/img/models/jackets/jacket-signature-4.webp",
    "/img/models/sweatshirts/crew-skull-red.webp",
    "/img/models/tracksuits/tracksuit-2.webp",
]

# ---------- write manifest ----------
sizes = {m["file"]: {"w": m["w"], "h": m["h"]} for m in MANIFEST}
data = {
    "models": models,
    "collections": coll_manifest,
    "aerial": aerial,
    "eye": eye,
    "prints": prints,
    "portfolio": portfolio,
    "sizes": sizes,
}
os.makedirs(os.path.join(ROOT, "src", "data"), exist_ok=True)
with open(os.path.join(ROOT, "src", "data", "assets.json"), "w", encoding="utf-8") as f:
    json.dump(data, f, indent=1, ensure_ascii=False)
# de-duplicate notes
seen, notes = set(), []
for n in REPLACE_LIST:
    key = (n["file"], n["note"])
    if key not in seen:
        seen.add(key)
        notes.append(n)
with open(os.path.join(ROOT, "IMAGES-TO-REPLACE.json"), "w", encoding="utf-8") as f:
    json.dump(notes, f, indent=1, ensure_ascii=False)
print("DONE", len(MANIFEST), "images;", len(notes), "notes")
