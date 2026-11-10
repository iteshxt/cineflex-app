import type { Metadata } from "next";
import { Bug, Mail, Scale, User } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { DEVELOPER, SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch about CineFlex: feedback, bugs, legal and copyright.",
};

const CHANNELS = [
  {
    icon: Mail,
    title: "General & feedback",
    body: "Ideas, questions or anything else.",
    href: `mailto:${SITE.contactEmail}?subject=CineFlex%20feedback`,
    cta: SITE.contactEmail,
  },
  {
    icon: Bug,
    title: "Report a bug",
    body: "Something broken? Open an issue on GitHub with steps to reproduce.",
    href: `${SITE.repo}/issues`,
    cta: "GitHub issues",
  },
  {
    icon: Scale,
    title: "Legal & copyright",
    body: "Rights holders, please follow the Copyright & DMCA process.",
    href: "/dmca",
    cta: "Copyright & DMCA",
  },
  {
    icon: User,
    title: "The developer",
    body: `Portfolio and other work by ${DEVELOPER.name}.`,
    href: DEVELOPER.website,
    cta: DEVELOPER.website.replace("https://", ""),
  },
];

export default function ContactPage() {
  return (
    <>
      <SiteHeader />
      <main className="px-gutter pb-20 pt-8 md:pt-14">
        <div className="mx-auto max-w-4xl">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Contact</p>
          <h1 className="mt-3 text-4xl font-bold tracking-[-0.035em] md:text-5xl">Say hello</h1>
          <p className="mt-4 max-w-xl text-lg text-text/75">
            CineFlex is a small independent project. The quickest way to reach it is below.
          </p>
          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {CHANNELS.map(({ icon: Icon, title, body, href, cta }) => {
              const external = href.startsWith("http");
              return (
                <a
                  key={title}
                  href={href}
                  {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
                  className="group rounded-3xl bg-surface p-6 ring-1 ring-line transition hover:-translate-y-0.5 hover:bg-surface-2 hover:ring-accent/40"
                >
                  <span className="flex size-11 items-center justify-center rounded-2xl bg-accent/10 text-accent transition group-hover:bg-accent group-hover:text-accent-ink">
                    <Icon className="size-5" />
                  </span>
                  <h2 className="mt-5 text-lg font-semibold tracking-tight">{title}</h2>
                  <p className="mt-1.5 text-[15px] text-muted">{body}</p>
                  <p className="mt-4 text-sm font-medium text-text group-hover:text-accent">{cta} →</p>
                </a>
              );
            })}
          </div>
        </div>
      </main>
    </>
  );
}
