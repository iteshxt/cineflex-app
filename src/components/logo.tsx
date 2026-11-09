import { useId } from "react";

const BACK = "M6.15 9v14l12.2-7Z";
const FRONT = "M13.65 9v14l12.2-7Z";

/**
 * CineFlex mark: a play triangle with a faded "echo" behind it, separated by a clean gap.
 * Drawn in the accent color on a transparent background.
 */
export function LogoMark({ className = "" }: { className?: string }) {
  const mask = useId();
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <defs>
        <mask id={mask}>
          <rect width="32" height="32" fill="#fff" />
          <path d={FRONT} fill="#000" stroke="#000" strokeWidth="6.4" strokeLinejoin="round" />
        </mask>
      </defs>
      <path
        d={BACK}
        fill="var(--accent)"
        stroke="var(--accent)"
        strokeWidth="3.2"
        strokeLinejoin="round"
        opacity=".43"
        mask={`url(#${mask})`}
      />
      <path d={FRONT} fill="var(--accent)" stroke="var(--accent)" strokeWidth="3.2" strokeLinejoin="round" />
    </svg>
  );
}

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <LogoMark className="size-7" />
      <span className="text-[19px] font-semibold tracking-[-0.035em]">CineFlex</span>
    </span>
  );
}
