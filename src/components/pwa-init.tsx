"use client";

import { useEffect } from "react";
import { initPwa } from "@/lib/pwa";

/** Registers the service worker and starts listening for the install prompt. */
export function PwaInit() {
  useEffect(() => {
    initPwa();
  }, []);
  return null;
}
