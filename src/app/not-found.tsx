import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
      <p className="text-5xl font-bold text-gradient-hero">404</p>
      <h1 className="mt-4 text-2xl font-bold text-content-primary">
        Page not found
      </h1>
      <p className="mt-2 text-sm text-content-secondary">
        The page you are looking for doesn&apos;t exist.
      </p>
      <Link
        href="/auctions"
        className="mt-6 inline-flex rounded-xl bg-gradient-btn-primary px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"
      >
        Back to auctions
      </Link>
    </main>
  );
}
