import { NextResponse, type NextRequest } from "next/server";

/**
 * First visit: "/" shows the landing page. Once someone opens the app (any app route),
 * a small functional cookie is set and "/" goes straight to /home from then on.
 * "/?welcome" always shows the landing page.
 */
export const RETURNING_COOKIE = "cf_returning";
const ONE_YEAR = 60 * 60 * 24 * 365;

export function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const returning = request.cookies.has(RETURNING_COOKIE);

  if (pathname === "/") {
    if (returning && !searchParams.has("welcome")) {
      return NextResponse.redirect(new URL("/home", request.url), 307);
    }
    return NextResponse.next();
  }

  // An app route: remember that this browser has used the app.
  const response = NextResponse.next();
  if (!returning) {
    response.cookies.set(RETURNING_COOKIE, "1", {
      path: "/",
      maxAge: ONE_YEAR,
      sameSite: "lax",
      secure: request.nextUrl.protocol === "https:",
      httpOnly: true,
    });
  }
  return response;
}

export const config = {
  matcher: [
    "/",
    "/home",
    "/movies",
    "/tv/:path*",
    "/movie/:path*",
    "/search",
    "/library",
    "/settings",
    "/collection/:path*",
    "/watch/:path*",
  ],
};
