"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, ChevronDown, Menu, X } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { site } from "@/config/site";
import { MODEL_SLUGS, MODEL_COVER } from "@/data/models";
import { LocaleSwitcher } from "./LocaleSwitcher";

export function Header() {
  const t = useTranslations("nav");
  const tm = useTranslations("models.items");
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [mega, setMega] = useState(false);
  const closeTimer = useRef<number | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // close menus on navigation
  useEffect(() => {
    setOpen(false);
    setMega(false);
  }, [pathname]);

  useEffect(() => {
    document.body.dataset.lock = open ? "true" : "false";
    return () => {
      document.body.dataset.lock = "false";
    };
  }, [open]);

  const openMega = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    setMega(true);
  };
  const closeMega = () => {
    closeTimer.current = window.setTimeout(() => setMega(false), 140);
  };

  const isActive = (p: string) => (p === "/" ? pathname === "/" : pathname.startsWith(p));
  const linkCls = (p: string) =>
    `font-display relative text-[0.72rem] font-bold uppercase tracking-[0.24em] transition-colors hover:text-white ${isActive(p) ? "text-white" : "text-muted"} after:absolute after:-bottom-2 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-red after:transition-transform after:duration-500 hover:after:scale-x-100 ${isActive(p) ? "after:scale-x-100" : ""}`;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${scrolled || open ? "glass shadow-[0_10px_40px_-20px_rgba(0,0,0,0.9)]" : "bg-transparent"}`}
      style={{ height: "var(--header-h)" }}
    >
      <div className="container-x flex h-full items-center justify-between gap-6">
        <Link href="/" aria-label={site.name} className="group relative flex items-center gap-3">
          <Image src="/img/brand/logo-emblem.png" alt="" width={44} height={44} priority className="h-10 w-auto transition-transform duration-500 group-hover:scale-105" />
          <Image src="/img/brand/logo-wordmark.png" alt={site.name} width={132} height={40} priority className="hidden h-7 w-auto sm:block" />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-9 lg:flex" aria-label="Main">
          <Link href="/" className={linkCls("/")}>{t("home")}</Link>

          <div className="relative" onMouseEnter={openMega} onMouseLeave={closeMega}>
            <Link
              href="/models"
              className={`${linkCls("/models")} inline-flex items-center gap-1.5`}
              aria-haspopup="true"
              aria-expanded={mega}
              onFocus={openMega}
            >
              {t("models")} <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-300 ${mega ? "rotate-180" : ""}`} />
            </Link>
            <AnimatePresence>
              {mega && (
                <motion.div
                  initial={{ opacity: 0, y: 12, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.98 }}
                  transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute left-1/2 top-[calc(100%+1.1rem)] w-[min(60rem,calc(100vw-4rem))] -translate-x-1/2"
                  onMouseEnter={openMega}
                  onMouseLeave={closeMega}
                >
                  <div className="glass rounded-2xl p-5 shadow-[0_40px_90px_-30px_rgba(0,0,0,1)]">
                    <div className="mb-4 flex items-center justify-between border-b border-line pb-3">
                      <p className="eyebrow">{t("modelsIntro")}</p>
                      <Link href="/models" className="font-display inline-flex items-center gap-1 text-[0.68rem] font-bold uppercase tracking-[0.2em] text-muted hover:text-white">
                        {t("allModels")} <ArrowUpRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                    <ul className="grid grid-cols-4 gap-2">
                      {MODEL_SLUGS.map((slug) => (
                        <li key={slug}>
                          <Link
                            href={{ pathname: "/models/[slug]", params: { slug } }}
                            className="group/item flex items-center gap-3 rounded-xl p-2 transition hover:bg-white/5"
                            onClick={() => setMega(false)}
                          >
                            <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-surface-2">
                              <Image src={MODEL_COVER[slug]} alt="" fill sizes="56px" className="object-contain p-1 transition-transform duration-500 group-hover/item:scale-110" />
                            </span>
                            <span>
                              <span className="font-display block text-[0.74rem] font-bold uppercase tracking-[0.14em] text-fg">{tm(`${slug}.name`)}</span>
                              <span className="block text-xs text-dim">{tm(`${slug}.short`)}</span>
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Link href="/art" className={linkCls("/art")}>{t("art")}</Link>
          <Link href="/contact" className={linkCls("/contact")}>{t("contact")}</Link>
          <a href={site.shopUrl} target="_blank" rel="noopener noreferrer" className="font-display inline-flex items-center gap-1 text-[0.72rem] font-bold uppercase tracking-[0.24em] text-muted transition-colors hover:text-white">
            {t("shop")} <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <LocaleSwitcher />
          <Link href="/contact" className="btn btn-primary hidden px-5 py-3 text-[0.66rem] md:inline-flex">
            {t("quote")}
          </Link>
          <button
            type="button"
            className="rounded-md border border-line-2 p-2 text-fg lg:hidden"
            aria-label={open ? t("close") : t("openMenu")}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-x-0 bottom-0 top-[var(--header-h)] z-40 overflow-y-auto bg-ink/95 backdrop-blur-xl lg:hidden"
            data-lenis-prevent
          >
            <motion.nav
              aria-label="Mobile"
              className="container-x flex flex-col gap-2 py-8"
              initial="hidden"
              animate="show"
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
            >
              {[
                { href: "/" as const, label: t("home") },
                { href: "/models" as const, label: t("models") },
                { href: "/art" as const, label: t("art") },
                { href: "/contact" as const, label: t("contact") },
              ].map((item) => (
                <motion.div key={item.href} variants={{ hidden: { opacity: 0, x: -14 }, show: { opacity: 1, x: 0 } }}>
                  <Link href={item.href} className="display-md block border-b border-line py-4 text-chrome">
                    {item.label}
                  </Link>
                </motion.div>
              ))}
              <motion.div variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }} className="pt-6">
                <p className="eyebrow eyebrow-line mb-4">{t("modelsIntro")}</p>
                <ul className="grid grid-cols-2 gap-x-4 gap-y-2.5">
                  {MODEL_SLUGS.map((slug) => (
                    <li key={slug}>
                      <Link href={{ pathname: "/models/[slug]", params: { slug } }} className="flex items-center gap-3 text-sm text-muted">
                        <span className="relative h-9 w-9 overflow-hidden rounded-md bg-surface-2">
                          <Image src={MODEL_COVER[slug]} alt="" fill sizes="36px" className="object-contain p-0.5" />
                        </span>
                        {tm(`${slug}.name`)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </motion.div>
              <motion.div variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }} className="mt-8 flex flex-wrap items-center gap-3">
                <Link href="/contact" className="btn btn-primary">{t("quote")}</Link>
                <a href={site.shopUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
                  {t("shop")} <ArrowUpRight className="h-4 w-4" />
                </a>
              </motion.div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
