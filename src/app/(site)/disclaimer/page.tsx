import type { Metadata } from "next";
import Link from "next/link";
import { ProsePage, Summary } from "@/components/prose-page";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Disclaimer",
  description: "CineFlex does not host any video. Content is provided by third parties.",
};

export default function DisclaimerPage() {
  return (
    <ProsePage eyebrow="Legal" title="Disclaimer" updated={SITE.legalUpdated}>
      <Summary>
        CineFlex does not host, upload or store any video. It shows information from TMDB and opens a third-party player.
        We don’t control what that player shows.
      </Summary>

      <h2>No hosted content</h2>
      <p>
        CineFlex does not host, upload, store, transmit or index any video files on its servers. Video playback happens
        inside an embedded player operated by an independent third party. CineFlex has no control over, and no knowledge of,
        the sources that player uses or the content it delivers.
      </p>

      <h2>Information accuracy</h2>
      <p>
        Titles, descriptions, ratings, release dates, cast and artwork are provided by{" "}
        <a href="https://www.themoviedb.org" target="_blank" rel="noreferrer">
          TMDB
        </a>{" "}
        and may be incomplete or out of date. This product uses the TMDB API but is not endorsed or certified by TMDB.
      </p>

      <h2>Third-party players and advertising</h2>
      <p>
        Third-party players may display their own advertising or content. CineFlex’s ad shield (on by default) prevents the
        player from opening pop-ups or redirecting the page, but it cannot remove content drawn inside the player itself.
        CineFlex is not responsible for any third-party advertising, links or content.
      </p>

      <h2>No affiliation</h2>
      <p>
        CineFlex is an independent project. It is not affiliated with, sponsored by or endorsed by any film studio,
        broadcaster, streaming service, rights holder, TMDB or the player provider. All trademarks and artwork belong to
        their respective owners.
      </p>

      <h2>Your responsibility</h2>
      <p>
        Laws on accessing content differ between countries. You are responsible for making sure your use of CineFlex and any
        third-party service complies with the law where you live. See the <Link href="/terms">Terms of Use</Link>.
      </p>

      <h2>Copyright concerns</h2>
      <p>
        If you’re a rights holder, please see <Link href="/dmca">Copyright &amp; DMCA</Link> for how to reach us and how
        listings are handled.
      </p>
    </ProsePage>
  );
}
