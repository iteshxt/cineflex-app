import { Suspense } from "react";
import { Nav, NavView } from "@/components/nav";
import { AppFooter } from "@/components/site-footer";

/** App shell: navigation rail / mobile pill around every in-app page. */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Suspense fallback={<NavView pathname="" />}>
        <Nav />
      </Suspense>
      <div className="pb-28 md:pb-0 md:pl-rail">
        {/* At least a screen tall, so short pages (search, empty states) never pull the footer into view. */}
        <div className="min-h-dvh">{children}</div>
        <Suspense>
          <AppFooter />
        </Suspense>
      </div>
    </>
  );
}
