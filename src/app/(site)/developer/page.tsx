import type { Metadata } from "next";
import { ArrowUpRight, Globe, Mail } from "lucide-react";
import { GithubIcon as Github, LinkedinIcon as Linkedin } from "@/components/brand-icons";
import { SiteHeader } from "@/components/site-header";
import { DEVELOPER, SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Developer",
  description: `CineFlex is designed and built by ${DEVELOPER.name}, ${DEVELOPER.role.toLowerCase()}.`,
};

const LINKS = [
  { icon: Globe, label: "Website", value: "iteshxt.me", href: DEVELOPER.website },
  { icon: Github, label: "GitHub", value: "github.com/iteshxt", href: DEVELOPER.github },
  { icon: Linkedin, label: "LinkedIn", value: "linkedin.com/in/iteshxt", href: DEVELOPER.linkedin },
  { icon: Mail, label: "Email", value: DEVELOPER.email, href: `mailto:${DEVELOPER.email}` },
];

export default function DeveloperPage() {
  const initials = DEVELOPER.name
    .split(" ")
    .map((p) => p[0])
    .join("");
  return (
    <>
      <SiteHeader />
      <main className="px-gutter pb-20 pt-8 md:pt-14">
        <div className="mx-auto max-w-5xl">
          {/* Intro */}
          <section className="relative overflow-hidden rounded-[2rem] bg-surface p-8 ring-1 ring-line md:p-12">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_0%,color-mix(in_oklab,var(--accent)_18%,transparent),transparent_60%)]" />
            <div className="relative flex flex-col gap-8 md:flex-row md:items-center">
              <span className="flex size-24 shrink-0 items-center justify-center rounded-3xl bg-accent text-3xl font-bold tracking-tight text-accent-ink">
                {initials}
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Developer</p>
                <h1 className="mt-2 text-4xl font-bold tracking-[-0.035em] md:text-5xl">{DEVELOPER.name}</h1>
                <p className="mt-2 text-lg text-text/75">
                  {DEVELOPER.role} · <span className="text-muted">{DEVELOPER.tagline}</span>
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <a
                    href={DEVELOPER.website}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-11 items-center gap-2 rounded-full bg-text px-5 text-sm font-semibold text-black transition hover:bg-white"
                  >
                    Visit iteshxt.me <ArrowUpRight className="size-4" />
                  </a>
                  <a
                    href={SITE.repo}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-11 items-center gap-2 rounded-full bg-white/[0.06] px-5 text-sm font-semibold ring-1 ring-white/15 transition hover:bg-white/10"
                  >
                    <Github className="size-4" /> CineFlex source
                  </a>
                </div>
              </div>
            </div>
          </section>

          <div className="mt-10 grid gap-10 md:grid-cols-[1.3fr_1fr]">
            {/* About + skills */}
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-faint">About</h2>
              <p className="mt-4 text-[15.5px] leading-relaxed text-text/80">
                Software developer crafting interactive web experiences — turning complex ideas into pixel-perfect,
                performant applications across the full stack, with hands-on work in fine-tuning language models and
                AI-powered tools. CineFlex is one of those projects: designed and built end to end, from the interface to
                the data layer.
              </p>

              <h2 className="mt-10 text-xs font-semibold uppercase tracking-[0.16em] text-faint">Skills</h2>
              <dl className="mt-4 space-y-4">
                {Object.entries(DEVELOPER.skills).map(([group, items]) => (
                  <div key={group}>
                    <dt className="text-sm font-medium text-text">{group}</dt>
                    <dd className="mt-2 flex flex-wrap gap-1.5">
                      {items.map((s) => (
                        <span key={s} className="rounded-full bg-surface px-3 py-1 text-xs text-muted ring-1 ring-line">
                          {s}
                        </span>
                      ))}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>

            {/* Links */}
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-faint">Find me</h2>
              <ul className="mt-4 divide-y divide-line rounded-2xl bg-surface ring-1 ring-line">
                {LINKS.map(({ icon: Icon, label, value, href }) => (
                  <li key={label}>
                    <a
                      href={href}
                      {...(href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}
                      className="group flex items-center gap-4 px-5 py-4 transition hover:bg-white/[0.03]"
                    >
                      <Icon className="size-5 text-muted group-hover:text-accent" />
                      <span className="min-w-0 flex-1">
                        <span className="block text-xs text-faint">{label}</span>
                        <span className="block truncate text-[15px] text-text">{value}</span>
                      </span>
                      <ArrowUpRight className="size-4 text-faint transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-accent" />
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {/* Projects */}
          <section className="mt-14">
            <div className="flex items-end justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-faint">Other projects</h2>
              <a
                href={`${DEVELOPER.website}/#projects`}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-muted transition hover:text-accent"
              >
                All projects →
              </a>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {DEVELOPER.projects.map((p) => (
                <div key={p.name} className="rounded-2xl bg-surface p-5 ring-1 ring-line">
                  <h3 className="font-semibold tracking-tight">{p.name}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">{p.blurb}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
