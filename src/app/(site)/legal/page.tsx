import type { Metadata } from "next";
import Link from "next/link";
import { ProsePage } from "@/components/prose-page";
import { LEGAL_LINKS, SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Legal & Data",
  description: "All CineFlex legal documents and a plain overview of what data flows where.",
};

const FLOWS = [
  ["Your list, history, settings, searches", "Your browser only", "Never sent to CineFlex"],
  ["Page and search requests", "CineFlex server (Vercel)", "To show pages and results; standard host logs"],
  ["Title data (names, overviews, episodes)", "TMDB API, via our server", "TMDB sees our server, not you"],
  ["Posters and backdrops", "TMDB image servers", "Your browser loads them directly"],
  ["Video playback", "Third-party embedded player", "Only when you open the player"],
  ["Trailers", "YouTube", "Only when you click a trailer link"],
];

export default function LegalPage() {
  const docs = LEGAL_LINKS.filter((l) => l.href !== "/legal");
  return (
    <ProsePage
      eyebrow="Legal"
      title="Legal & Data"
      updated={SITE.legalUpdated}
      intro="Everything about how CineFlex works, what it does with data and the rules for using it — in one place."
    >
      <div className="not-prose grid gap-3 sm:grid-cols-2">
        {docs.map((d) => (
          <Link
            key={d.href}
            href={d.href}
            className="rounded-2xl bg-surface px-5 py-4 text-[15px] font-medium no-underline ring-1 ring-line transition hover:bg-surface-2 hover:ring-accent/40"
          >
            {d.label} <span className="text-faint">→</span>
          </Link>
        ))}
      </div>

      <h2>Data at a glance</h2>
      <div className="overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>What</th>
              <th>Goes to</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {FLOWS.map(([what, where, note]) => (
              <tr key={what}>
                <td>{what}</td>
                <td>{where}</td>
                <td>{note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>What CineFlex is (and isn’t)</h2>
      <ul>
        <li>An interface for browsing film and TV information and opening a third-party player.</li>
        <li>Not a streaming service: it does not host, upload, store or transmit any video files.</li>
        <li>Not affiliated with, endorsed by or certified by TMDB, the player provider, or any studio or rights holder.</li>
      </ul>

      <h2>Attribution</h2>
      <p>
        Film and TV metadata and images are provided by{" "}
        <a href="https://www.themoviedb.org" target="_blank" rel="noreferrer">
          The Movie Database (TMDB)
        </a>
        . This product uses the TMDB API but is not endorsed or certified by TMDB. All trademarks, titles and artwork belong
        to their respective owners.
      </p>

      <h2>Contact</h2>
      <p>
        Legal, privacy or copyright questions: <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>. For copyright
        notices, please follow the steps on the <Link href="/dmca">Copyright &amp; DMCA</Link> page.
      </p>
    </ProsePage>
  );
}
