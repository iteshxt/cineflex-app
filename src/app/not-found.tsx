import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-[70dvh] flex-col items-start justify-center px-gutter">
      <p className="text-sm font-medium text-accent">404</p>
      <h1 className="mt-2 text-3xl font-bold tracking-[-0.03em] md:text-4xl">This title isn’t playing here.</h1>
      <p className="mt-2 text-muted">It may have been removed, or the link is wrong.</p>
      <Link
        href="/"
        className="mt-6 inline-flex h-11 items-center rounded-full bg-text px-6 text-sm font-semibold text-black hover:bg-white"
      >
        Back to home
      </Link>
    </main>
  );
}
