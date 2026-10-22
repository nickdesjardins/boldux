import { notFound } from "next/navigation";

/** Catch-all so unknown paths within a locale render the localized not-found page. */
export default function CatchAll() {
  notFound();
}
