/** Site-wide facts used by the landing, footer and legal pages. Edit here, not in pages. */

export const SITE = {
  name: "CineFlex",
  tagline: "Movies & series, beautifully simple.",
  url: "https://cineflex-app-beta.vercel.app",
  repo: "https://github.com/iteshxt/cineflex-app",
  contactEmail: "iteshxt@gmail.com",
  /** Date the legal pages were last revised. */
  legalUpdated: "November 9, 2026",
} as const;

export type ProductStatus = "Live" | "Beta" | "In development";

export type Product = {
  name: string;
  tagline: string;
  description: string;
  status: ProductStatus;
  /** Short labels describing the product (not a skills list). */
  tags: string[];
  url?: string;
  repo?: string;
  /** Accent used for the card artwork. */
  hue: string;
  org?: string;
};

export const DEVELOPER = {
  name: "iteshxt",
  role: "Software Developer",
  website: "https://iteshxt.me",
  github: "https://github.com/iteshxt",
  linkedin: "https://linkedin.com/in/iteshxt",
  email: "iteshxt@gmail.com",
  products: [
    {
      name: "Arcee",
      tagline: "A desktop agent that does the task, not just the talking.",
      description:
        "A model-agnostic desktop agent for Ubuntu. Give it a voice or text request and it plans the work, carries it out step by step with the shell, files, browser and desktop, and reports back — asking before anything risky.",
      status: "In development",
      tags: ["Desktop agent", "Linux / GNOME", "Local or cloud models"],
      repo: "https://github.com/iteshxt/arcee-agent",
      hue: "#7c9cff",
    },
    {
      name: "Dia Chat",
      tagline: "An AI companion that stays on your device.",
      description:
        "A privacy-first AI chat that runs the model right in your browser with WebGPU. Real-time streaming, saved history and optional voice — no cloud, no tracking.",
      status: "Live",
      tags: ["On-device AI", "WebGPU", "Privacy-first"],
      url: "https://chat.dialabs.tech",
      repo: "https://github.com/DiaLabs/dia-chat",
      hue: "#f472b6",
      org: "DiaLabs",
    },
    {
      name: "PatentIQ",
      tagline: "Smarter patent evaluation, stronger innovations.",
      description: "An AI-assisted tool for evaluating patents, currently in beta.",
      status: "Beta",
      tags: ["Patents", "AI evaluation"],
      url: "https://patentiq.dialabs.tech",
      repo: "https://github.com/DiaLabs/PatentIQ",
      hue: "#34d399",
      org: "DiaLabs",
    },
  ] satisfies Product[],
} as const;

export const LEGAL_LINKS = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Use" },
  { href: "/cookies", label: "Cookies & Storage" },
  { href: "/disclaimer", label: "Disclaimer" },
  { href: "/dmca", label: "Copyright & DMCA" },
  { href: "/legal", label: "Legal & Data" },
] as const;

export const SITE_LINKS = [
  { href: "/?welcome", label: "Welcome" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
  { href: "/developer", label: "Developer" },
  { href: "/contact", label: "Contact" },
] as const;

export const APP_LINKS = [
  { href: "/home", label: "Home" },
  { href: "/movies", label: "Movies" },
  { href: "/tv", label: "Series" },
  { href: "/search", label: "Search" },
  { href: "/library", label: "Library" },
] as const;
