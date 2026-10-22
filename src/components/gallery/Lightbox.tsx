"use client";

import Image, { getImageProps } from "next/image";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useTranslations } from "next-intl";

const subscribeNever = () => () => {};
const getClientTrue = () => true;
const getServerFalse = () => false;

export type LightboxImage = { src: string; alt: string; caption?: React.ReactNode };

const SIZES = "(min-width: 1280px) 1152px, 100vw";
const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
const SWIPE_PX = 48;
const EASE = [0.16, 1, 0.3, 1] as const;

/* Direction-aware slide: opacity + transform only, so it stays on the compositor. */
const slide = {
  enter: (dir: number) => ({ opacity: 0, x: dir * 36, scale: 0.98 }),
  center: { opacity: 1, x: 0, scale: 1 },
  exit: (dir: number) => ({ opacity: 0, x: dir * -28, scale: 0.98 }),
};

/** Warm the cache with the exact candidate next/image will request for this viewport. */
function warm(src: string) {
  const { props } = getImageProps({ src, alt: "", fill: true, sizes: SIZES });
  const img = new window.Image();
  if (props.sizes) img.sizes = props.sizes;
  if (props.srcSet) img.srcset = props.srcSet;
  img.src = props.src;
}

export function Lightbox({
  images,
  index,
  onClose,
  onIndex,
}: {
  images: LightboxImage[];
  index: number | null;
  onClose: () => void;
  onIndex: (i: number) => void;
}) {
  const t = useTranslations("common");
  // false during SSR, true on the client (portal target exists) without a setState-in-effect
  const mounted = useSyncExternalStore(subscribeNever, getClientTrue, getServerFalse);
  const dialogRef = useRef<HTMLDivElement>(null);
  const [dir, setDir] = useState(1);
  const swipe = useRef<{ x: number; y: number } | null>(null);
  const swiped = useRef(false);
  const open = index !== null;
  const total = images.length;
  const i = index ?? 0;

  const go = useCallback(
    (step: number) => {
      if (total < 2) return;
      setDir(step > 0 ? 1 : -1);
      onIndex((i + step + total) % total);
    },
    [i, onIndex, total],
  );
  const prev = useCallback(() => go(-1), [go]);
  const next = useCallback(() => go(1), [go]);

  /* Scroll lock + focus management: one run per open/close cycle. */
  useEffect(() => {
    if (!open) return;
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const body = document.body;
    const gutter = window.innerWidth - document.documentElement.clientWidth;
    body.dataset.lock = "true";
    if (gutter > 0) body.style.paddingRight = `${gutter}px`; // keep the page from shifting when the scrollbar goes
    dialogRef.current?.focus({ preventScroll: true });
    return () => {
      delete body.dataset.lock;
      body.style.paddingRight = "";
      trigger?.focus({ preventScroll: true });
    };
  }, [open]);

  /* Keyboard: Escape closes, arrows / Home / End navigate, Tab cycles inside the dialog. */
  useEffect(() => {
    if (!open) return;
    const trapTab = (e: KeyboardEvent) => {
      const root = dialogRef.current;
      if (!root) return;
      const nodes = Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (nodes.length === 0) {
        e.preventDefault();
        return;
      }
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      const active = document.activeElement;
      const inside = active instanceof HTMLElement && active !== root && root.contains(active);
      const wrap = e.shiftKey ? !inside || active === first : !inside || active === last;
      if (wrap) {
        e.preventDefault();
        (e.shiftKey ? last : first).focus();
      }
    };
    const onKey = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          e.preventDefault();
          onClose();
          break;
        case "ArrowLeft":
          prev();
          break;
        case "ArrowRight":
          next();
          break;
        case "Home":
          if (total > 1) {
            setDir(-1);
            onIndex(0);
          }
          break;
        case "End":
          if (total > 1) {
            setDir(1);
            onIndex(total - 1);
          }
          break;
        case "Tab":
          trapTab(e);
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, onIndex, prev, next, total]);

  /* Preload the neighbours so arrows and swipes feel instant. */
  const nextSrc = total > 1 ? images[(i + 1) % total]?.src : undefined;
  const prevSrc = total > 1 ? images[(i - 1 + total) % total]?.src : undefined;
  useEffect(() => {
    if (!open) return;
    for (const src of [nextSrc, prevSrc]) if (src) warm(src);
  }, [open, nextSrc, prevSrc]);

  /* Pointer swipe (touch, pen or mouse drag). The click that follows a swipe must not close the dialog. */
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    swipe.current = { x: e.clientX, y: e.clientY };
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const start = swipe.current;
    swipe.current = null;
    if (!start) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    if (Math.abs(dx) < SWIPE_PX || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    swiped.current = true;
    setTimeout(() => {
      swiped.current = false;
    }, 0);
    if (dx < 0) next();
    else prev();
  };
  const onBackdropClick = () => {
    if (!swiped.current) onClose();
  };

  if (!mounted) return null;
  const img = open ? images[i] : null;
  const counter = img ? t("imageOf", { current: i + 1, total }) : "";

  return createPortal(
    <AnimatePresence>
      {open && img && (
        <motion.div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label={img.alt}
          tabIndex={-1}
          className="fixed inset-0 z-[90] flex touch-pan-y items-center justify-center bg-ink/95 p-4 outline-none sm:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          onClick={onBackdropClick}
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onPointerCancel={() => {
            swipe.current = null;
          }}
          data-lenis-prevent
        >
          {/* Stable live region: the figure below is re-keyed on every navigation. */}
          <span className="sr-only" aria-live="polite">
            {counter}
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            aria-label={t("close")}
            className="absolute right-4 top-4 z-10 rounded-full border border-line-2 bg-ink/60 p-3 text-fg transition hover:border-red hover:text-white sm:right-6 sm:top-6"
          >
            <X className="h-5 w-5" />
          </button>
          {total > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  prev();
                }}
                aria-label={t("previous")}
                className="absolute left-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-line-2 bg-ink/60 p-3 text-fg transition hover:border-red hover:text-white sm:left-6"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  next();
                }}
                aria-label={t("next")}
                className="absolute right-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-line-2 bg-ink/60 p-3 text-fg transition hover:border-red hover:text-white sm:right-6"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
          <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 h-[56rem] w-[56rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(227,16,31,0.12),rgba(227,16,31,0.04)_45%,transparent)]" />
          <AnimatePresence mode="wait" custom={dir}>
            <motion.figure
              key={i}
              custom={dir}
              variants={slide}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.28, ease: EASE }}
              className="relative flex max-h-full w-full max-w-6xl select-none flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative h-[68vh] w-full sm:h-[74vh]">
                <Image src={img.src} alt={img.alt} fill sizes={SIZES} className="object-contain" priority draggable={false} />
              </div>
              <figcaption className="mt-4 flex w-full flex-col items-center gap-1 text-center">
                {img.caption && <div className="max-w-2xl text-sm text-muted">{img.caption}</div>}
                <span aria-hidden className="font-display text-[0.62rem] uppercase tracking-[0.3em] text-dim">
                  {counter}
                </span>
              </figcaption>
            </motion.figure>
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
