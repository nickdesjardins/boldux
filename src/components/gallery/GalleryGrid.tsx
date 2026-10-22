"use client";

import { useState } from "react";
import { Maximize2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Img, imgSize } from "@/components/ui/Img";
import { RevealGroup, RevealItem } from "@/components/motion/Reveal";
import { Lightbox, type LightboxImage } from "./Lightbox";

type Cols = 2 | 3 | 4;
type Tile = { cls: string; sizes: string };
type Layout = { grid: string; tiles: Tile[] };

/* Fixed layouts (every tile shares the `aspect` the caller passes, e.g. prints on the art page). */
const FIXED_GRID: Record<Cols, string> = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-2 lg:grid-cols-4",
};
const FIXED_SIZES: Record<Cols, string> = {
  2: "(min-width: 640px) 50vw, 100vw",
  3: "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw",
  4: "(min-width: 1024px) 25vw, 50vw",
};

/* Auto layouts: the gallery usually sits in a two-thirds column, hence the conservative lg widths. */
const AUTO_GRID: Record<Cols, string> = {
  2: "grid-cols-2",
  3: "grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-2 lg:grid-cols-4",
};
const TILE_SIZES: Record<Cols, string> = {
  2: "(min-width: 1024px) 30vw, 50vw",
  3: "(min-width: 1024px) 20vw, 50vw",
  4: "(min-width: 1024px) 15vw, 50vw",
};
const SPAN_SIZES: Record<Cols, string> = {
  2: "(min-width: 1024px) 60vw, 100vw",
  3: "(min-width: 1024px) 40vw, 100vw",
  4: "(min-width: 1024px) 30vw, 100vw",
};

function fixedLayout(images: string[], cols: Cols, aspect: string): Layout {
  return { grid: FIXED_GRID[cols], tiles: images.map(() => ({ cls: aspect, sizes: FIXED_SIZES[cols] })) };
}

/**
 * Picks tile shapes from the asset manifest. The gallery's median aspect ratio chooses the base
 * tile (landscape, square, portrait or tall) and the column count; the odd image out then gets a
 * two-row or two-column cell, so a wide "front + back" duo is never squeezed into a portrait tile
 * and a tall back shot never floats inside a landscape one. Every class below is a literal so
 * Tailwind can see it.
 */
function autoLayout(images: string[], colsOverride?: Cols): Layout {
  const ratios = images.map((src) => {
    const { w, h } = imgSize(src);
    return w / h;
  });
  const sorted = [...ratios].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)] ?? 1;
  const base = median >= 1.25 ? "wide" : median > 0.9 ? "square" : median > 0.6 ? "portrait" : "tall";
  const n = images.length;
  // Duo images need width: landscape galleries stay at two columns. Smaller families keep two
  // columns too so the tiles stay generous; six or more (or a clean multiple of three) go to three.
  const cols: Cols = colsOverride ?? (base === "wide" ? 2 : n >= 6 || n % 3 === 0 ? 3 : 2);
  const grid = base === "wide" && cols === 2 ? "grid-cols-1 sm:grid-cols-2" : AUTO_GRID[cols];

  const tiles = ratios.map<Tile>((r) => {
    switch (base) {
      case "wide":
        // A portrait shot inside a landscape family takes two rows: 1 col × (2 × 2/3 + gap) ≈ 3:4.
        return r < 1.1 ? { cls: "aspect-[3/4] row-span-2", sizes: TILE_SIZES[cols] } : { cls: "aspect-[3/2]", sizes: TILE_SIZES[cols] };
      case "square":
        if (r >= 1.4) return { cls: "aspect-[2/1] col-span-2", sizes: SPAN_SIZES[cols] };
        if (r <= 0.7) return { cls: "aspect-[1/2] row-span-2", sizes: TILE_SIZES[cols] };
        return { cls: "aspect-square", sizes: TILE_SIZES[cols] };
      case "portrait":
        return r >= 1.25 ? { cls: "aspect-[8/5] col-span-2", sizes: SPAN_SIZES[cols] } : { cls: "aspect-[4/5]", sizes: TILE_SIZES[cols] };
      default:
        return r >= 1.25 ? { cls: "aspect-[4/3] col-span-2", sizes: SPAN_SIZES[cols] } : { cls: "aspect-[2/3]", sizes: TILE_SIZES[cols] };
    }
  });
  return { grid, tiles };
}

export function GalleryGrid({
  images,
  alt,
  cols,
  aspect,
  className = "",
  light = false,
}: {
  images: string[];
  /** Base alt text; the index is appended for uniqueness */
  alt: string;
  /** Column count. Optional: without `aspect` the grid derives it from the images. */
  cols?: Cols;
  /** Force one tile shape for every image (e.g. "aspect-square"); omit to size tiles per image. */
  aspect?: string;
  className?: string;
  /** Light "paper" tiles for dark artwork */
  light?: boolean;
}) {
  const t = useTranslations("common");
  const [index, setIndex] = useState<number | null>(null);
  const items: LightboxImage[] = images.map((src, i) => ({ src, alt: `${alt} ${i + 1}` }));
  const { grid, tiles } = aspect ? fixedLayout(images, cols ?? 3, aspect) : autoLayout(images, cols);

  return (
    <>
      <RevealGroup as="ul" className={`grid gap-4 ${grid} ${className}`} stagger={0.05}>
        {images.map((src, i) => (
          <RevealItem as="li" key={`${src}-${i}`} className={`group relative self-stretch ${tiles[i].cls}`}>
            <button
              type="button"
              onClick={(e) => {
                // Safari does not focus a clicked button; make sure the lightbox can hand focus back here.
                e.currentTarget.focus({ preventScroll: true });
                setIndex(i);
              }}
              aria-label={`${t("openImage")} ${i + 1}`}
              className={`card card-hover absolute inset-0 block h-full w-full overflow-hidden text-left focus-visible:border-red-bright ${light ? "bg-[#ecebe7]" : ""}`}
            >
              <div aria-hidden className={`absolute inset-0 ${light ? "bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.04),transparent_70%)]" : "bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.08),transparent_65%)]"}`} />
              <Img
                src={src}
                alt={`${alt} ${i + 1}`}
                sizes={tiles[i].sizes}
                className="absolute inset-0 h-full w-full object-contain p-5 transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.06] group-focus-within:scale-[1.06] product-shadow"
              />
              <span aria-hidden className="absolute right-3 top-3 rounded-full border border-line-2 bg-ink/70 p-2 text-fg opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100">
                <Maximize2 className="h-3.5 w-3.5" />
              </span>
            </button>
          </RevealItem>
        ))}
      </RevealGroup>
      <Lightbox images={items} index={index} onClose={() => setIndex(null)} onIndex={setIndex} />
    </>
  );
}
