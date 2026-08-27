import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-ink-900 px-5 text-center">
      <div>
        <p className="metric text-[3rem] font-semibold text-jade">404</p>
        <p className="mt-2 text-[1rem] text-mute">Nothing here.</p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-full border border-ink-600 px-6 py-3 text-[15px] font-medium text-bone hover:bg-ink-700"
        >
          Metron
        </Link>
      </div>
    </main>
  );
}
