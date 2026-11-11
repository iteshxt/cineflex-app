import type { Metadata } from "next";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Answers to common questions about CineFlex: cost, privacy, playback, installing the app and more.",
};

type QA = { id?: string; q: string; a: React.ReactNode };

const GROUPS: { title: string; items: QA[] }[] = [
  {
    title: "The basics",
    items: [
      { q: "Is CineFlex free?", a: "Yes. No subscription, no trial, no payment details." },
      { q: "Do I need an account?", a: "No. Open the app and start watching. Your list and progress are saved in your browser." },
      {
        q: "Where do the videos come from?",
        a: (
          <>
            CineFlex doesn’t host any video. Titles and artwork come from TMDB, and playback opens a third-party embedded
            player. See the <Link href="/disclaimer">disclaimer</Link>.
          </>
        ),
      },
    ],
  },
  {
    title: "Playback",
    items: [
      {
        q: "A title won’t play. What can I do?",
        a: "Use the reload button in the player’s top bar. If it still won’t load, the provider may not have that title yet or may be busy — try again later. If you turned the ad shield off, try turning it back on, or vice-versa.",
      },
      {
        q: "What is the ad shield?",
        a: "It sandboxes the third-party player so clicks inside it can’t open pop-up ads or redirect you to other sites. It’s on by default and can be changed in Settings or from the shield button in the player.",
      },
      {
        q: "Why do I still see ads inside the player?",
        a: "The shield blocks pop-ups and redirects, but anything the provider draws inside its own player frame is outside CineFlex’s control.",
      },
      {
        q: "Why does a strange link appear at the bottom of the screen over the video?",
        a: "The video provider lays an invisible ad link over its player, and your browser shows where any link points when you hover it. With the ad shield on, clicking it can’t open an ad or leave CineFlex, and if it ever replaces the player, CineFlex puts the player back where you were. The link itself lives inside the provider’s player, so CineFlex can’t remove it.",
      },
      {
        q: "Does it remember where I stopped?",
        a: "Yes. Continue Watching takes you back to the title or episode, and the player starts close to where you left off. If you skip around inside the player, the saved spot can be a little off.",
      },
    ],
  },
  {
    title: "Your data",
    items: [
      {
        q: "What does CineFlex know about me?",
        a: (
          <>
            Practically nothing. There are no accounts or trackers. Your list, history and settings live only in your
            browser. Details in the <Link href="/privacy">Privacy Policy</Link>.
          </>
        ),
      },
      {
        q: "Will my list sync between devices?",
        a: "Not yet — everything is stored locally on each device and browser.",
      },
      {
        q: "How do I clear my history?",
        a: (
          <>
            Go to <Link href="/settings">Settings</Link> → Your data, or remove a single title from Continue Watching with
            its ✕ button.
          </>
        ),
      },
    ],
  },
  {
    title: "The app",
    items: [
      {
        id: "install",
        q: "How do I install CineFlex?",
        a: (
          <>
            <strong>Android (Chrome):</strong> tap “Install” on the banner, or open the ⋮ menu → “Install app”.{" "}
            <strong>iPhone/iPad (Safari):</strong> tap Share → “Add to Home Screen”. <strong>Desktop (Chrome/Edge):</strong>{" "}
            click the install icon in the address bar. You can also use the Install button in{" "}
            <Link href="/settings">Settings</Link>.
          </>
        ),
      },
      {
        q: "Does it work offline?",
        a: "Pages you’ve visited can open offline in the installed app, but browsing new titles and playing video need a connection.",
      },
      {
        q: "Can I change the colors?",
        a: "Yes — pick an accent color in Settings. It applies to the whole app and the video player.",
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <>
      <SiteHeader />
      <main className="px-gutter pb-20 pt-8 md:pt-14">
        <div className="mx-auto max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Help</p>
          <h1 className="mt-3 text-4xl font-bold tracking-[-0.035em] md:text-5xl">Frequently asked questions</h1>
          <p className="mt-4 text-lg text-text/75">
            Can’t find an answer? <Link href="/contact" className="text-accent hover:underline">Get in touch</Link>.
          </p>

          <div className="mt-12 space-y-12">
            {GROUPS.map((g) => (
              <section key={g.title} aria-label={g.title}>
                <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-faint">{g.title}</h2>
                <div className="mt-4 divide-y divide-line rounded-2xl bg-surface ring-1 ring-line">
                  {g.items.map((item) => (
                    <details key={item.q} id={item.id} className="group scroll-mt-24 px-5 [&_summary::-webkit-details-marker]:hidden">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-[15px] font-medium">
                        {item.q}
                        <ChevronDown className="size-4 shrink-0 text-faint transition-transform duration-200 group-open:rotate-180" />
                      </summary>
                      <div className="pb-5 text-[15px] leading-relaxed text-muted [&_a]:text-text [&_a]:underline [&_a]:decoration-accent/60 [&_a]:underline-offset-2 [&_strong]:text-text">
                        {item.a}
                      </div>
                    </details>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <p className="mt-12 text-sm text-faint">
            Still stuck? Email <a href={`mailto:${SITE.contactEmail}`} className="text-muted hover:text-accent">{SITE.contactEmail}</a>.
          </p>
        </div>
      </main>
    </>
  );
}
