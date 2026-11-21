import { NextResponse, type NextRequest } from "next/server";
import { RETURNING_COOKIE } from "@/lib/returning";

/**
 * First visit: "/" shows the landing page. Once someone has opened the app, "/" goes
 * straight to /home ("/?welcome" always shows the landing page). The cookie is set in the
 * browser by the app shell, so this proxy only has to run for "/" and every app page stays
 * a plain cacheable response.
 */
export function proxy(request: NextRequest) {
  const returning = request.cookies.has(RETURNING_COOKIE);
  if (returning && !request.nextUrl.searchParams.has("welcome")) {
    return NextResponse.redirect(new URL("/home", request.url), 307);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/"],
};
