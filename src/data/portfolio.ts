import assets from "./assets.json";

/** Order matters: it is the filter-chip order on the home page. */
export const PROJECT_IDS = ["industrial", "northern", "residence", "farm", "team"] as const;
export type ProjectId = (typeof PROJECT_IDS)[number];

const galleries = assets.portfolio as Record<ProjectId, string[]>;

export type Project = {
  id: ProjectId;
  cover: string;
  images: string[];
  tags: string[];
  /** Which model families this project used (links to /models/[slug]) */
  models: string[];
};

export const PROJECTS: Project[] = [
  { id: "industrial", cover: "/img/portfolio/industrial/hero.webp", images: galleries.industrial, tags: ["hoodie", "long-sleeve", "tee"], models: ["hoodies", "long-sleeves", "tshirts"] },
  { id: "northern", cover: "/img/portfolio/northern/mix.webp", images: galleries.northern, tags: ["hoodie", "cap", "beanie", "mug"], models: ["hoodies", "caps", "beanies", "accessories"] },
  { id: "residence", cover: "/img/portfolio/residence/hoodie-burgundy.webp", images: galleries.residence, tags: ["hoodie", "tee", "jersey"], models: ["hoodies", "tshirts"] },
  { id: "farm", cover: "/img/portfolio/farm/hoodie-grey.webp", images: galleries.farm, tags: ["hoodie"], models: ["hoodies"] },
  { id: "team", cover: "/img/portfolio/team/hoodie-blue.webp", images: galleries.team, tags: ["hoodie"], models: ["hoodies"] },
];

export type WallTile = { src: string; project: ProjectId; big?: boolean };

/**
 * The portfolio wall on the home page: every client piece from the mockup deck, curated and
 * ordered for visual rhythm (projects interleaved). `big` marks the one 2x2 anchor tile.
 */
export const WALL: WallTile[] = [
  { src: "/img/portfolio/industrial/hero.webp", project: "industrial", big: true },
  { src: "/img/portfolio/northern/hoodie-red-duo.webp", project: "northern" },
  { src: "/img/portfolio/residence/hoodie-burgundy.webp", project: "residence" },
  { src: "/img/portfolio/northern/cap-red.webp", project: "northern" },
  { src: "/img/portfolio/industrial/long-sleeve-duo.webp", project: "industrial" },
  { src: "/img/portfolio/team/hoodie-blue.webp", project: "team" },
  { src: "/img/portfolio/northern/mix.webp", project: "northern" },
  { src: "/img/portfolio/industrial/tee-duo.webp", project: "industrial" },
  { src: "/img/portfolio/northern/hoodie-ice-duo.webp", project: "northern" },
  { src: "/img/portfolio/farm/hoodie-grey.webp", project: "farm" },
  { src: "/img/portfolio/residence/tee-black.webp", project: "residence" },
  { src: "/img/portfolio/northern/cap-navy.webp", project: "northern" },
  { src: "/img/portfolio/northern/hoodie-camo.webp", project: "northern" },
  { src: "/img/models/beanies/beanies-duo.webp", project: "northern" },
  { src: "/img/portfolio/residence/tee-sport.webp", project: "residence" },
  { src: "/img/portfolio/northern/hoodie-fade-duo.webp", project: "northern" },
  { src: "/img/models/accessories/mug.webp", project: "northern" },
  { src: "/img/portfolio/northern/hoodie-red-stripes.webp", project: "northern" },
  { src: "/img/portfolio/northern/cap-blue.webp", project: "northern" },
  { src: "/img/models/long-sleeves/long-sleeve-white.webp", project: "industrial" },
];
