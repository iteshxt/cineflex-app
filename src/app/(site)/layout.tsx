import { SiteFooter } from "@/components/site-footer";

/** Public site pages (landing, about, legal): no app rail, shared footer. */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <SiteFooter />
    </>
  );
}
