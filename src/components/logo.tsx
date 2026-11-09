export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect width="32" height="32" rx="9" fill="var(--accent)" />
      <path d="M12 9.5v13l10.5-6.5L12 9.5Z" fill="#09090b" />
    </svg>
  );
}
