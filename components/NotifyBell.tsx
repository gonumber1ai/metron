"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Unread coach messages, in the header.
 *
 * Before this there was no way to tell a customer anything he would notice.
 * The coach could reply inside his thread, but nothing on any screen said a
 * reply existed — he had to go looking. A broadcast to two hundred men would
 * have reached whoever happened to open Messages that week.
 *
 * It re-checks when the route changes rather than on a timer. A man moves
 * between screens constantly while doing a session, so that is frequent enough
 * to feel live, and it costs nothing while he sits on one page reading.
 *
 * A failed check shows no badge. A phantom badge he cannot clear is worse than
 * a message he sees an hour late.
 */
export function NotifyBell({ locale, className = "" }: { locale: string; className?: string }) {
  const [count, setCount] = useState(0);
  const pathname = usePathname();
  const href = `/${locale}/app/messages`;

  useEffect(() => {
    let live = true;
    fetch("/api/messages/unread")
      .then((r) => (r.ok ? r.json() : { unread: 0 }))
      .then((d: { unread?: number }) => {
        if (live) setCount(Number(d.unread ?? 0));
      })
      .catch(() => {
        /* no badge rather than a wrong one */
      });
    return () => {
      live = false;
    };
  }, [pathname]);

  const onMessages = pathname.startsWith(href);

  return (
    <Link
      href={href}
      aria-label={
        count > 0
          ? locale === "fr"
            ? `Messages, ${count} non lus`
            : `Messages, ${count} unread`
          : locale === "fr"
            ? "Messages"
            : "Messages"
      }
      className={`relative grid h-9 w-9 place-items-center rounded-full transition-colors ${
        onMessages ? "text-jade" : "text-mute hover:text-bone"
      } ${className}`}
    >
      <svg viewBox="0 0 24 24" className="h-[21px] w-[21px]" fill="none" aria-hidden>
        <path
          d="M18 8a6 6 0 1 0-12 0c0 6-2 7-2 7h16s-2-1-2-7ZM13.7 20a2 2 0 0 1-3.4 0"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {count > 0 && (
        <span className="absolute right-0.5 top-0.5 grid h-[17px] min-w-[17px] place-items-center rounded-full bg-alert px-1 text-[10px] font-bold text-white">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Link>
  );
}
