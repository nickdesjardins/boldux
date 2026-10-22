import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Run on every path except API routes, Next internals and static files (anything with a dot).
  // `[.]` is used instead of `\.` so the pattern survives any shell/JSON escaping.
  matcher: "/((?!api|_next|_vercel|.*[.].*).*)",
};
