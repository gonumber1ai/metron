import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const LOCALES = ["en", "fr"];
const DEFAULT = "en";

/**
 * Every page lives under /en or /fr. A bare path is redirected to the
 * visitor's preferred language, falling back to English.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const hasLocale = LOCALES.some(
    (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`),
  );
  if (hasLocale) return NextResponse.next();

  const header = request.headers.get("accept-language") ?? "";
  const preferred = header.toLowerCase().startsWith("fr") || header.toLowerCase().includes(",fr")
    ? "fr"
    : DEFAULT;

  const url = request.nextUrl.clone();
  url.pathname = `/${preferred}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!api|_next|favicon.ico|manifest.webmanifest|.*\..*).*)"],
};
