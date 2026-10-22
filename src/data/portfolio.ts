import assets from "./assets.json";

/** Order matters: it is the placement order in the bento grid (xl, tall, sm, sm, wide + CTA tile). */
export const PROJECT_IDS = ["industrial", "northern", "farm", "team", "residence"] as const;
export type ProjectId = (typeof PROJECT_IDS)[number];

const galleries = assets.portfolio as Record<ProjectId, string[]>;

export type Project = {
  id: ProjectId;
  cover: string;
  images: string[];
  /** Bento sizing: "xl" spans 2 cols + 2 rows, "wide" spans 2 cols, "tall" spans 2 rows */
  size: "xl" | "wide" | "tall" | "sm";
  tags: string[];
  /** Which model families this project used (links to /models/[slug]) */
  models: string[];
};

export const PROJECTS: Project[] = [
  {
    id: "industrial",
    cover: "/img/portfolio/industrial/hero.webp",
    images: galleries.industrial,
    size: "xl",
    tags: ["hoodie", "long-sleeve", "tee"],
    models: ["hoodies", "long-sleeves", "tshirts"],
  },
  {
    id: "northern",
    cover: "/img/portfolio/northern/mix.webp",
    images: galleries.northern,
    size: "tall",
    tags: ["hoodie", "cap", "beanie", "mug"],
    models: ["hoodies", "caps", "beanies", "accessories"],
  },
  {
    id: "farm",
    cover: "/img/portfolio/farm/hoodie-grey.webp",
    images: galleries.farm,
    size: "sm",
    tags: ["hoodie"],
    models: ["hoodies"],
  },
  {
    id: "team",
    cover: "/img/portfolio/team/hoodie-blue.webp",
    images: galleries.team,
    size: "sm",
    tags: ["hoodie"],
    models: ["hoodies"],
  },
  {
    id: "residence",
    cover: "/img/portfolio/residence/hoodie-burgundy.webp",
    images: galleries.residence,
    size: "wide",
    tags: ["hoodie", "tee", "jersey"],
    models: ["hoodies", "tshirts"],
  },
];
