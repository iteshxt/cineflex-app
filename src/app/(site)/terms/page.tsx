import type { Metadata } from "next";
import Link from "next/link";
import { ProsePage, Summary } from "@/components/prose-page";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "The rules for using CineFlex.",
};

export default function TermsPage() {
  return (
    <ProsePage eyebrow="Legal" title="Terms of Use" updated={SITE.legalUpdated}>
      <Summary>
        Use CineFlex for personal, non-commercial viewing and follow the law where you live. CineFlex doesn’t host video and
        can’t guarantee what third-party players show. The service is provided as-is, for free.
      </Summary>

      <p>
        By accessing or using CineFlex (the website and the installable app), you agree to these Terms. If you don’t agree,
        please don’t use the service.
      </p>

      <h2>1. The service</h2>
      <p>
        CineFlex is a free interface for discovering films and TV series. Information and artwork come from TMDB. Playback is
        provided by a third-party embedded player that CineFlex does not operate. CineFlex does not host, upload, store or
        distribute any video content. See the <Link href="/disclaimer">Disclaimer</Link>.
      </p>

      <h2>2. Eligibility</h2>
      <p>
        You must be old enough to agree to these Terms where you live, or have a parent or guardian’s permission. Some titles
        are intended for mature audiences; you’re responsible for choosing what’s appropriate for you and anyone watching with
        you.
      </p>

      <h2>3. Acceptable use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>use CineFlex in a way that breaks any law that applies to you, including copyright law;</li>
        <li>scrape, overload, probe or disrupt the service or its infrastructure;</li>
        <li>attempt to bypass security features, or misuse the API routes for automated bulk access;</li>
        <li>resell, rebrand or redistribute the service commercially;</li>
        <li>use the service to harass anyone or to distribute malicious code.</li>
      </ul>
      <p>
        You are responsible for checking whether accessing particular content is lawful in your country. Availability of
        third-party content varies by region.
      </p>

      <h2>4. Third-party content and services</h2>
      <p>
        Metadata, images, trailers and video playback are provided by third parties (including TMDB, YouTube and the player
        provider). Their content and conduct are their responsibility, governed by their own terms. CineFlex doesn’t endorse,
        verify or control third-party content and isn’t liable for it, including any advertising shown inside a third-party
        player.
      </p>

      <h2>5. Intellectual property</h2>
      <p>
        Film and TV titles, posters, artwork and trademarks belong to their respective owners and are shown for
        identification and informational purposes. The CineFlex name, logo and the design of the site belong to its
        developer. If you believe something on CineFlex infringes your rights, see{" "}
        <Link href="/dmca">Copyright &amp; DMCA</Link>.
      </p>

      <h2>6. Your data</h2>
      <p>
        CineFlex has no accounts. Preferences are stored on your device as described in the{" "}
        <Link href="/privacy">Privacy Policy</Link> and <Link href="/cookies">Cookies &amp; Storage</Link>.
      </p>

      <h2>7. No warranty</h2>
      <p>
        CineFlex is provided “as is” and “as available”, without warranties of any kind, express or implied — including
        accuracy of information, availability of any title, or uninterrupted, error-free operation. Features may change or be
        discontinued at any time.
      </p>

      <h2>8. Limitation of liability</h2>
      <p>
        To the fullest extent permitted by law, the developer of CineFlex is not liable for any indirect, incidental, special,
        consequential or punitive damages, or for any loss of data, arising from your use of, or inability to use, the service
        or any third-party content accessed through it.
      </p>

      <h2>9. Termination</h2>
      <p>
        We may restrict or end access to the service, or remove any feature or listing, at any time and without notice —
        including to comply with a valid legal request.
      </p>

      <h2>10. Governing law</h2>
      <p>
        These Terms are governed by the laws of India, without regard to conflict-of-law rules. Nothing in these Terms limits
        rights you have under mandatory consumer law where you live.
      </p>

      <h2>11. Changes</h2>
      <p>
        We may update these Terms from time to time. The date at the top shows the latest version. Continued use after a
        change means you accept the updated Terms.
      </p>

      <h2>12. Contact</h2>
      <p>
        Questions about these Terms: <a href={`mailto:${SITE.contactEmail}`}>{SITE.contactEmail}</a>.
      </p>
    </ProsePage>
  );
}
