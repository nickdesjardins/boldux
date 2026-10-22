import Image, { type ImageProps } from "next/image";
import assets from "@/data/assets.json";

const sizes = assets.sizes as Record<string, { w: number; h: number }>;

type Props = Omit<ImageProps, "src" | "width" | "height" | "alt"> & {
  src: string;
  alt: string;
  /** Fallback width/height if the file isn't in the manifest */
  w?: number;
  h?: number;
};

/** next/image with width/height resolved from the generated asset manifest. */
export function Img({ src, alt, w, h, ...rest }: Props) {
  const dim = sizes[src];
  const width = dim?.w ?? w ?? 1200;
  const height = dim?.h ?? h ?? 900;
  return <Image src={src} alt={alt} width={width} height={height} {...rest} />;
}

export function imgSize(src: string) {
  return sizes[src] ?? { w: 1200, h: 900 };
}
