import { ArrowRight, ArrowUpRight } from "lucide-react";
import type { ComponentProps } from "react";
import { Link } from "@/i18n/navigation";

type Variant = "primary" | "solid" | "ghost" | "light";
type Size = "md" | "lg" | "sm";

const variantClass: Record<Variant, string> = {
  primary: "btn btn-primary",
  solid: "btn btn-solid",
  ghost: "btn btn-ghost",
  light: "btn btn-light",
};
const sizeClass: Record<Size, string> = {
  sm: "py-3 px-4 text-[0.68rem]",
  md: "",
  lg: "py-5 px-8 text-[0.84rem]",
};

type Common = { variant?: Variant; size?: Size; icon?: "arrow" | "external" | "none"; className?: string; children: React.ReactNode };

type LinkProps = Common & { href: ComponentProps<typeof Link>["href"]; external?: false };
type ExternalProps = Common & { href: string; external: true };
type ButtonProps = Common & Omit<ComponentProps<"button">, "className" | "children"> & { href?: undefined; external?: undefined };

export function Button(props: LinkProps | ExternalProps | ButtonProps) {
  const { variant = "primary", size = "md", icon = "arrow", className = "", children } = props;
  const cls = `${variantClass[variant]} ${sizeClass[size]} ${className} group/btn`;
  const Icon =
    icon === "none" ? null : icon === "external" ? (
      <ArrowUpRight className="h-4 w-4 transition-transform duration-500 group-hover/btn:-translate-y-0.5 group-hover/btn:translate-x-0.5" aria-hidden />
    ) : (
      <ArrowRight className="h-4 w-4 transition-transform duration-500 group-hover/btn:translate-x-1" aria-hidden />
    );

  if ("href" in props && props.href !== undefined) {
    if (props.external) {
      return (
        <a href={props.href} className={cls} target="_blank" rel="noopener noreferrer">
          <span>{children}</span>
          {Icon}
        </a>
      );
    }
    return (
      <Link href={props.href} className={cls}>
        <span>{children}</span>
        {Icon}
      </Link>
    );
  }
  const { variant: _v, size: _s, icon: _i, className: _c, children: _ch, href: _h, external: _e, ...rest } = props as ButtonProps;
  void _v; void _s; void _i; void _c; void _ch; void _h; void _e;
  return (
    <button className={cls} {...rest}>
      <span>{children}</span>
      {Icon}
    </button>
  );
}
