import assets from "./assets.json";

export const ARTWORKS = ["skulls", "music", "warrior"] as const;
export type Artwork = (typeof ARTWORKS)[number];
export type Garment = "tee" | "hoodie";
export type View = "duo" | "front" | "back";

type CollectionAssets = Record<
  Artwork,
  {
    tee: Record<string, Partial<Record<View, string>>>;
    hoodie: Record<string, Partial<Record<View, string>>>;
    art: string[];
  }
>;

export const COLLECTIONS = assets.collections as CollectionAssets;

export function colourways(artwork: Artwork, garment: Garment): string[] {
  return Object.keys(COLLECTIONS[artwork][garment]);
}

export function collectionImage(artwork: Artwork, garment: Garment, colourway: string, view: View): string | undefined {
  const entry = COLLECTIONS[artwork][garment][colourway];
  return entry?.[view] ?? entry?.duo ?? entry?.front;
}

/** Hex swatches for the colourway chips (garment colour / print colour). */
export const SWATCH: Record<string, [string, string]> = {
  "black-red": ["#111114", "#e3101f"],
  "black-white": ["#111114", "#f4f4f6"],
  "blue-white": ["#1b2f8f", "#f4f4f6"],
  "grey-black": ["#9a9ca1", "#111114"],
  "red-white": ["#c8101d", "#f4f4f6"],
  "red-black": ["#c8101d", "#111114"],
  "white-black": ["#f4f4f6", "#111114"],
  "white-red": ["#f4f4f6", "#e3101f"],
  "orange-black": ["#f04a12", "#111114"],
};

export const AERIAL = assets.aerial as { garments: string[]; inspiration: string[] };
export const EYE_COLLECTION = assets.eye as string[];
export const PRINTS = assets.prints as string[];

/** Hero image for each collection card on the art page. */
export const COLLECTION_COVER: Record<Artwork | "aerial" | "eye", string> = {
  skulls: "/img/collections/skulls/hoodie-black-red-duo.webp",
  music: "/img/collections/music/tee-black-red-duo.webp",
  warrior: "/img/collections/warrior/tee-white-red-duo.webp",
  aerial: "/img/models/hoodies/zip-aerial-yellow.webp",
  eye: "/img/models/hoodies/zip-eye-back-red.webp",
};
