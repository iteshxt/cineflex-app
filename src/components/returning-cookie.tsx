"use client";

import { useEffect } from "react";
import { RETURNING_COOKIE, RETURNING_MAX_AGE } from "@/lib/returning";

/** Remembers that this browser has used the app (see src/proxy.ts). Renders nothing. */
export function ReturningCookie() {
  useEffect(() => {
    if (document.cookie.split("; ").some((c) => c.startsWith(`${RETURNING_COOKIE}=`))) return;
    const secure = location.protocol === "https:" ? "; secure" : "";
    document.cookie = `${RETURNING_COOKIE}=1; path=/; max-age=${RETURNING_MAX_AGE}; samesite=lax${secure}`;
  }, []);
  return null;
}
