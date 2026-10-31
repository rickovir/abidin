import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
      <p className="font-serif text-5xl font-bold text-stone-300">404</p>
      <h1 className="mt-4 font-serif text-2xl font-bold text-stone-900">
        Page not found
      </h1>
      <p className="mt-2 text-sm text-stone-600">
        The page you are looking for doesn&apos;t exist.
      </p>
      <Link
        href="/auctions"
        className="mt-6 inline-flex rounded-xl bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-stone-700"
      >
        Back to auctions
      </Link>
    </main>
  );
}
