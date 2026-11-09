import { SiteHeader } from "./site-header";

/** Layout for text pages (legal, about, FAQ): readable measure, quiet typography. */
export function ProsePage({
  eyebrow,
  title,
  intro,
  updated,
  children,
}: {
  eyebrow?: string;
  title: string;
  intro?: React.ReactNode;
  updated?: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <SiteHeader />
      <main className="px-gutter pb-20 pt-8 md:pt-14">
        <div className="mx-auto max-w-3xl">
          {eyebrow && (
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
              {eyebrow}
            </p>
          )}
          <h1
            className={`${eyebrow ? "mt-3" : ""} text-4xl font-bold tracking-[-0.035em] md:text-5xl`}
          >
            {title}
          </h1>
          {updated && (
            <p className="mt-3 text-sm text-faint">Last updated {updated}</p>
          )}
          {intro && (
            <div className="mt-6 text-lg leading-relaxed text-text/80">
              {intro}
            </div>
          )}
          <div className="prose-cf mt-10">{children}</div>
        </div>
      </main>
    </>
  );
}

/** Short "in plain words" callout shown at the top of legal pages. */
export function Summary({ children }: { children: React.ReactNode }) {
  return (
    <aside className="not-prose mb-10 rounded-2xl bg-accent/[0.07] p-5 ring-1 ring-accent/20">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">
        In short
      </p>
      <div className="mt-2 text-[15px] leading-relaxed text-text/85">
        {children}
      </div>
    </aside>
  );
}
