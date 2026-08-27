"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getDict } from "@/lib/i18n";
import { LocaleSwitch } from "./LocaleSwitch";
import { useMetron } from "./useMetron";
import { latest, formatDuration } from "@/lib/store";
import { totalDays } from "@/lib/content/protocol";
import { LinkPending } from "./Pending";
import { NavPendingProvider, NavPendingProbe } from "./NavOverlay";
import { NotifyBell } from "./NotifyBell";
import { Logo, LogoMark } from "./Logo";

type Item = { href: string; label: string; icon: React.ReactNode };

function Icon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-[22px] w-[22px]" aria-hidden>
      <path
        d={d}
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const PATHS = {
  today: "M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
  program: "M4 5h16M4 12h16M4 19h10",
  measure: "M3 17h4l3-9 4 14 3-9h4",
  progress: "M4 19V9m5 10V5m5 14v-7m5 7V8",
  lessons: "M4 5.5A2.5 2.5 0 0 1 6.5 3H19v15H6.5A2.5 2.5 0 0 0 4 20.5V5.5Z",
  messages: "M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.4A8 8 0 1 1 21 12Z",
  settings:
    "M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm7.4-2.2a7.6 7.6 0 0 0 0-2.6l2-1.5-2-3.4-2.3 1a7.7 7.7 0 0 0-2.3-1.3L14.4 3H9.6l-.4 2.5a7.7 7.7 0 0 0-2.3 1.3l-2.3-1-2 3.4 2 1.5a7.6 7.6 0 0 0 0 2.6l-2 1.5 2 3.4 2.3-1a7.7 7.7 0 0 0 2.3 1.3l.4 2.5h4.8l.4-2.5a7.7 7.7 0 0 0 2.3-1.3l2.3 1 2-3.4-2-1.5Z",
  // a checklist — the rules are a standing list, not a lesson
  rules: "M4 6h10M4 12h10M4 18h10M17.5 6.5l1.5 1.5 3-3M17.5 12.5l1.5 1.5 3-3",
  menu: "M4 7h16M4 12h16M4 17h16",
  close: "M6 6l12 12M18 6 6 18",
};

export function AppShell({
  locale,
  children,
}: {
  locale: string;
  children: React.ReactNode;
}) {
  const t = getDict(locale);
  const pathname = usePathname();
  const [drawer, setDrawer] = useState(false);
  const { state, ready } = useMetron(locale);

  const last = totalDays(state.plan ?? "test");
  const current = ready ? latest(state) : undefined;
  const pct = ready ? Math.round((state.day / last) * 100) : 0;

  const base = `/${locale}/app`;

  const primary: Item[] = [
    { href: base, label: t.nav.today, icon: <Icon d={PATHS.today} /> },
    { href: `${base}/program`, label: t.nav.program, icon: <Icon d={PATHS.program} /> },
    { href: `${base}/measure`, label: t.nav.measure, icon: <Icon d={PATHS.measure} /> },
    { href: `${base}/progress`, label: t.nav.progress, icon: <Icon d={PATHS.progress} /> },
  ];

  const secondary: Item[] = [
    { href: `${base}/rules`, label: t.nav.rules, icon: <Icon d={PATHS.rules} /> },
    { href: `${base}/lessons`, label: t.nav.lessons, icon: <Icon d={PATHS.lessons} /> },
    { href: `${base}/messages`, label: t.nav.messages, icon: <Icon d={PATHS.messages} /> },
    { href: `${base}/settings`, label: t.nav.settings, icon: <Icon d={PATHS.settings} /> },
  ];

  const all = [...primary, ...secondary];

  function active(href: string) {
    if (href === base) return pathname === base || pathname === `${base}/`;
    return pathname.startsWith(href);
  }

  return (
    <NavPendingProvider label={t.nav.opening}>
    <div className="min-h-screen md:flex">
      {/* ------------------------------------------------ desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-ink-700 bg-ink-800 p-4 md:flex">
        <div className="px-2 py-3">
          <Logo size="md" />
        </div>

        <nav className="mt-4 flex flex-1 flex-col gap-1">
          {all.map((it) => (
            <Link
              key={it.href}
              href={it.href}
              aria-current={active(it.href) ? "page" : undefined}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-[14.5px] font-medium transition-colors ${
                active(it.href)
                  ? "bg-jade-050 text-jade-300"
                  : "text-mute hover:bg-ink-700 hover:text-bone"
              }`}
            >
              {it.icon}
              <span className="flex-1">{it.label}</span>
              <LinkPending className="h-4 w-4 text-jade" />
              <NavPendingProbe />
            </Link>
          ))}
        </nav>

        <div className="flex items-center justify-between px-1 pt-4">
          <LocaleSwitch locale={locale} />
          <NotifyBell locale={locale} />
        </div>
      </aside>

      {/* ------------------------------------------------------- content */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar.
            No hamburger here — the bottom bar already has Menu. This space
            shows where he is and what his number is, which is the only thing
            he actually wants to see on every screen. */}
        <header className="sticky top-0 z-20 border-b border-ink-700 bg-ink-900/95 backdrop-blur md:hidden">
          <div className="flex items-center justify-between gap-3 px-4 py-2.5">
            <span className="flex items-baseline gap-2">
              <span className="metric text-[15px] font-bold text-jade">
                {t.common.day} {state.day}
              </span>
              <span className="text-[12px] text-faint">
                {t.common.of} {last}
              </span>
            </span>

            <span className="flex items-center gap-2">
            {current ? (
              <span className="flex items-baseline gap-1.5">
                <span className="text-[11px] uppercase tracking-wide text-faint">
                  {t.progress.theNumber}
                </span>
                <span className="metric text-[15px] font-bold text-bone">
                  {formatDuration(current.seconds, locale)}
                </span>
              </span>
            ) : (
              <span className="text-jade"><LogoMark className="h-[17px] w-[17px]" /></span>
            )}
              <NotifyBell locale={locale} className="-mr-1.5" />
            </span>
          </div>

          {/* thin programme progress line */}
          <div className="h-[3px] w-full bg-ink-700">
            <div
              className="h-full bg-jade transition-all duration-500"
              style={{ width: `${Math.max(pct, 2)}%` }}
            />
          </div>
        </header>

        <main className="min-w-0 flex-1 pb-24 md:pb-10">{children}</main>
      </div>

      {/* ------------------------------------------------ mobile tab bar */}
      <nav
        aria-label={t.nav.menu}
        className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-5 border-t border-ink-700 bg-ink-800/98 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
      >
        {primary.map((it) => (
          <Link
            key={it.href}
            href={it.href}
            aria-current={active(it.href) ? "page" : undefined}
            className={`relative flex flex-col items-center gap-1 py-2.5 text-[10.5px] font-medium transition-colors ${
              active(it.href) ? "text-jade" : "text-faint"
            }`}
          >
            {it.icon}
            {it.label}
            <span className="absolute inset-x-0 top-1 grid place-items-center">
              <LinkPending className="h-4 w-4 text-jade" />
            </span>
            <NavPendingProbe />
          </Link>
        ))}
        <button
          type="button"
          onClick={() => setDrawer(true)}
          className="flex flex-col items-center gap-1 py-2.5 text-[10.5px] font-medium text-faint"
        >
          <Icon d={PATHS.menu} />
          {t.nav.menu}
        </button>
      </nav>

      {/* ---------------------------------------------------- drawer */}
      {drawer && (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            type="button"
            aria-label={t.nav.close}
            onClick={() => setDrawer(false)}
            className="absolute inset-0 bg-black/60"
          />
          <div className="absolute inset-x-0 bottom-0 rounded-t-2xl border-t border-ink-600 bg-ink-800 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))]">
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-ink-500" />
            <nav className="flex flex-col gap-1">
              {all.map((it) => (
                <Link
                  key={it.href}
                  href={it.href}
                  onClick={() => setDrawer(false)}
                  className={`flex items-center gap-3 rounded-lg px-3 py-3 text-[15px] font-medium ${
                    active(it.href) ? "bg-jade-050 text-jade-300" : "text-bone hover:bg-ink-700"
                  }`}
                >
                  {it.icon}
                  <span className="flex-1">{it.label}</span>
                  <NavPendingProbe />
                </Link>
              ))}
            </nav>
            <div className="mt-4 flex items-center justify-between border-t border-ink-700 px-1 pt-4">
              <LocaleSwitch locale={locale} />
              <button
                type="button"
                onClick={() => setDrawer(false)}
                className="rounded-full border border-ink-600 px-4 py-2 text-[13px] text-mute"
              >
                {t.nav.close}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </NavPendingProvider>
  );
}
