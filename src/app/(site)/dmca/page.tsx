import type { Metadata } from "next";
import { ProsePage, Summary } from "@/components/prose-page";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Copyright & DMCA",
  description: "How rights holders can contact CineFlex about copyright concerns.",
};

export default function DmcaPage() {
  return (
    <ProsePage eyebrow="Legal" title="Copyright & DMCA" updated={SITE.legalUpdated}>
      <Summary>
        CineFlex stores no video, so there are no files on our servers to take down. We do respect rights holders: send a
        notice and we’ll remove the relevant listing from CineFlex and point you to the party that hosts the content.
      </Summary>

      <h2>How CineFlex works</h2>
      <p>
        CineFlex displays publicly available film and TV information from TMDB and opens an embedded player run by an
        independent third party. No video is uploaded to, stored on, or served from CineFlex’s servers.
      </p>

      <h2>Sending a notice</h2>
      <p>
        If you believe content accessible through CineFlex infringes your copyright, email{" "}
        <a href={`mailto:${SITE.contactEmail}?subject=Copyright%20notice`}>{SITE.contactEmail}</a> with the subject
        “Copyright notice” and include:
      </p>
      <ul>
        <li>your name, organisation (if any) and contact details;</li>
        <li>the copyrighted work you believe is infringed;</li>
        <li>the exact CineFlex URL(s) concerned (for example a title or player page);</li>
        <li>a statement that you have a good-faith belief the use is not authorised by the owner, its agent or the law;</li>
        <li>
          a statement that the information is accurate and, under penalty of perjury, that you are the owner or authorised to
          act on the owner’s behalf;
        </li>
        <li>your physical or electronic signature.</li>
      </ul>

      <h2>What we’ll do</h2>
      <ul>
        <li>Review valid notices promptly.</li>
        <li>Disable the relevant title listing and player link on CineFlex where appropriate.</li>
        <li>
          Because the video itself is hosted by a third party, we’ll also suggest you contact that provider so the content can
          be removed at its source.
        </li>
      </ul>

      <h2>Counter-notices</h2>
      <p>
        If you believe a listing was removed by mistake, reply to the same address explaining why, with your contact details
        and a statement made in good faith.
      </p>

      <p>
        Please send only copyright matters to this process. Other questions are welcome at the same address.
      </p>
    </ProsePage>
  );
}
