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

export const DEVELOPER = {
  name: "Itesh Tomar",
  role: "Software Developer",
  tagline: "Crafting digital experiences with code & creativity",
  website: "https://iteshxt.me",
  github: "https://github.com/iteshxt",
  linkedin: "https://linkedin.com/in/iteshxt",
  email: "iteshxt@gmail.com",
  skills: {
    Languages: ["Python", "JavaScript", "TypeScript", "Java", "C++"],
    Web: ["React", "Next.js", "Node.js", "Tailwind CSS", "MongoDB", "FastAPI"],
    "AI / ML": ["PyTorch", "TensorFlow", "Fine-tuning (LoRA, PEFT)", "RAG"],
    Tools: ["GitHub", "Docker", "Vercel", "AWS", "Linux"],
  },
  projects: [
    { name: "DiaChat", blurb: "A fine-tuned Gemma-3 1B for Gen Z, running in the browser via WebGPU." },
    { name: "FitCheckr", blurb: "AI virtual try-on with a companion Chrome extension." },
    { name: "DiaMod", blurb: "Cross-platform AI moderation for Discord, WhatsApp and Telegram." },
    { name: "UniBites", blurb: "A production e-canteen app built with Flutter and Firebase." },
  ],
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
