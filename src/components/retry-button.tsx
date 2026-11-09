"use client";

export function RetryButton() {
  return (
    <button
      type="button"
      onClick={() => location.reload()}
      className="mt-6 inline-flex h-11 items-center rounded-full bg-text px-6 text-sm font-semibold text-black hover:bg-white"
    >
      Try again
    </button>
  );
}
