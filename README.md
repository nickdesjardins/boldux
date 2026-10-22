# Boldux Art — website

Bilingual (EN default / FR auto-detected) marketing site for Boldux Art: custom apparel, private label and corporate clothing. Built with Next.js 16 (App Router), Tailwind CSS 4, next-intl, Motion and Lenis.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000. A browser whose language is French is redirected to `/fr`.

Production build:

```bash
npm run build
npm start
```

## Configuration

Copy `.env.example` to `.env.local` and fill in:

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Public URL used for canonical links, hreflang, sitemap and Open Graph (default `https://boldux.ca`). |
| `SMTP2GO_API_KEY` | API key from SMTP2GO (Settings → API Keys). Needs the *Email send* permission. |
| `SMTP2GO_SENDER` | From address, e.g. `Boldux Art <no-reply@boldux.ca>`. The domain must be verified in SMTP2GO. |
| `CONTACT_TO` | Where contact-form messages land (`boldux.ca@gmail.com`). |
| `NEXT_PUBLIC_SMOOTH_SCROLL` | Set to `1` to enable inertial (Lenis) scrolling. Off by default: native scrolling stays smoother on most Windows laptops. |

Public links (shop URL, public email, social accounts) live in `src/config/site.ts`.

## Structure

```
messages/           en.json / fr.json — every word on the site
public/img/         generated images (see scripts/prepare-assets.py)
scripts/            asset pipeline
src/app/[locale]/   pages: home, models, models/[slug], art, contact
src/app/api/contact route handler → SMTP2GO
src/app/og/[file]   generated Open Graph images (/og/en.png, /og/fr.png)
src/components/     home sections, gallery + lightbox, layout, motion helpers
src/data/           models, portfolio, collections (reads assets.json)
src/i18n/           next-intl routing (localized paths: /models ↔ /fr/modeles)
src/proxy.ts        locale detection + redirects
```

## Images

`scripts/prepare-assets.py` reads the original artwork from the parent `Boldux` folder, cuts the mockups out of the PDF decks, removes backgrounds (rembg) and writes optimized WebP files into `public/img`, plus `src/data/assets.json` (the manifest the site reads) and `IMAGES-TO-REPLACE.json` (images worth swapping for cleaner originals).

```bash
pip install pillow numpy pymupdf rembg onnxruntime
python -X utf8 scripts/prepare-assets.py          # only missing files
python -X utf8 scripts/prepare-assets.py --force  # regenerate everything
```

To replace an image, drop the new file at the same path under `public/img` (same name) — no code change needed.

## Performance notes

Judge scrolling on a production build, not on `npm run dev`: the dev server serves unminified code with React's development checks and recompiles on the fly, which is noticeably heavier on phones and on modest GPUs. Use the Vercel deployment, or locally:

```bash
npm run build
```

```bash
npm start
```

then open http://localhost:3000 (or your PC's network address from a phone).

- Every animation is transform/opacity only (no blur or backdrop-filter animations); ambient glows are flat radial gradients, not blurred discs; product cut-outs carry a baked-in shadow (`scripts/bake-shadows.py`) instead of a CSS filter.
- The hero and art-teaser parallax are CSS scroll-driven animations (`animation-timeline`), so they run on the compositor thread with no JavaScript per scroll frame; browsers without scroll timelines show a static layout.
- Scroll reveals use Motion's `whileInView`; the hero parallax layers are composited (`will-change: transform`).
- Long French display words ("PERSONNALISÉS") size themselves to their container with container-query units (`src/lib/fit.ts`), so headlines never clip.
- Open Graph images are generated at build time from the logo and the studio photo (`src/app/og/[file]/route.tsx`).

## SEO

- Localized metadata, canonical + `hreflang` (en-CA, fr-CA, x-default) on every page
- `sitemap.xml` with language alternates, `robots.txt`, `manifest.webmanifest`
- JSON-LD: Organization/LocalBusiness, WebSite, BreadcrumbList, ItemList (models), Product (each model), Person (artist), ContactPage
- Generated Open Graph images per language
