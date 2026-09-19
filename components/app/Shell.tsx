"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMetron } from "@/components/useMetron";
import { planOf, toProgress } from "@/lib/store";
import { currentDay } from "@/lib/gating";
import { LinkPending } from "@/components/Pending";
import { NavPendingProvider, NavPendingProbe } from "@/components/NavOverlay";
import { LogoMark } from "@/components/Logo";

/**
 * The app shell, Section 4 of the brief.
 *
 * Three tabs and nothing else in the bar: Today, Program, Progress. Top
 * right, a gold ring with today's day number in it — that is his avatar,
 * because nothing else about him is known — and it opens the slide-in menu.
 * No Messages anywhere. Help is a form.
 */

const T = {
  en: {
    today: "Today", program: "Program", progress: "Progress",
    menu: "Menu", close: "Close",
    account: "My account", p10: "10-Day Challenge", p30: "30-Day Program",
    foundations: "Daily Rules & Foundations", lessons: "Lessons", help: "Help & Support",
    privacy: "Privacy", terms: "Terms", logout: "Log out", day: "Day",
  },
  fr: {
    today: "Aujourd'hui", program: "Programme", progress: "Progrès",
    menu: "Menu", close: "Fermer",
    account: "Mon compte", p10: "Défi 10 jours", p30: "Programme 30 jours",
    foundations: "Règles & fondations", lessons: "Leçons", help: "Aide & support",
    privacy: "Confidentialité", terms: "Conditions", logout: "Se déconnecter", day: "Jour",
  },
} as const;

const ICON = {
  today: "M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
  program: "M4 5h16M4 12h16M4 19h10",
  progress: "M4 19V9m5 10V5m5 14v-7m5 7V8",
};
function Icon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-[22px] w-[22px]" aria-hidden>
      <path d={d} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** The gold ring with the day number. His avatar. */
export function DayRing({ day, size = 40 }: { day: number; size?: number }) {
  return (
    <span
      className="grid place-items-center rounded-full font-bold text-jade"
      style={{
        width: size, height: size,
        border: "2px solid var(--color-jade)",
        boxShadow: "0 0 0 3px rgb(212 175 55 / .18), 0 0 18px rgb(212 175 55 / .25)",
        fontSize: size * 0.4,
        background: "radial-gradient(circle at 50% 30%, rgb(212 175 55 / .16), transparent 70%)",
      }}
      aria-hidden
    >
      {day}
    </span>
  );
}

export function Shell({ locale, children }: { locale: string; children: React.ReactNode }) {
  const t = T[locale === "fr" ? "fr" : "en"];
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { state, ready } = useMetron(locale);
  const base = `/${locale}/app`;
  const day = ready ? currentDay(planOf(state), toProgress(state)) : 1;

  const tabs = [
    { href: base, label: t.today, d: ICON.today },
    { href: `${base}/program`, label: t.program, d: ICON.program },
    { href: `${base}/progress`, label: t.progress, d: ICON.progress },
  ];
  const menu = [
    { href: `${base}/settings`, label: t.account },
    { href: `${base}/program`, label: t.p10 },
    { href: `${base}/program?tab=p30`, label: t.p30 },
    { href: `${base}/rules`, label: t.foundations },
    { href: `${base}/lessons`, label: t.lessons },
    { href: `${base}/help`, label: t.help },
    { href: `/${locale}/privacy`, label: t.privacy },
    { href: `/${locale}/terms`, label: t.terms },
  ];
  const active = (href: string) => (href === base ? pathname === base || pathname === `${base}/` : pathname.startsWith(href.split("?")[0]));

  return (
    <NavPendingProvider label="…">
      <div className="min-h-screen bg-[#070D0F] text-bone">
        {/* ------------------------------------------------------- top bar */}
        <header className="sticky top-0 z-20 border-b border-white/[.06] bg-[#070D0F]/95 backdrop-blur">
          <div className="mx-auto flex max-w-xl items-center justify-between px-4 py-2.5">
            <span className="flex items-center gap-2 text-jade">
              <LogoMark className="h-[18px] w-[18px]" />
              <span className="text-[13px] font-bold tracking-[0.12em] text-bone/80">METRON</span>
            </span>
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label={t.menu}
              className="rounded-full"
            >
              <DayRing day={day} />
            </button>
          </div>
        </header>

        <main className="mx-auto min-w-0 max-w-xl pb-24">{children}</main>

        {/* -------------------------------------------------------- tabs */}
        <nav
          aria-label={t.menu}
          className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-3 border-t border-white/[.06] bg-[#0A1113]/98 pb-[env(safe-area-inset-bottom)] backdrop-blur"
        >
          {tabs.map((it) => (
            <Link
              key={it.href}
              href={it.href}
              aria-current={active(it.href) ? "page" : undefined}
              className={`relative flex flex-col items-center gap-1 py-2.5 text-[10.5px] font-semibold transition-colors ${
                active(it.href) ? "text-jade" : "text-white/45"
              }`}
            >
              <Icon d={it.d} />
              {it.label}
              <span className="absolute inset-x-0 top-1 grid place-items-center"><LinkPending className="h-4 w-4 text-jade" /></span>
              <NavPendingProbe />
            </Link>
          ))}
        </nav>

        {/* ------------------------------------------------- slide-in menu */}
        {open && (
          <div className="fixed inset-0 z-40">
            <button type="button" aria-label={t.close} onClick={() => setOpen(false)} className="absolute inset-0 bg-black/70" />
            <aside className="absolute inset-y-0 right-0 flex w-[82%] max-w-sm flex-col border-l border-white/[.08] bg-[#0A1113] p-5 pt-[calc(1.25rem+env(safe-area-inset-top))]">
              <div className="flex items-center gap-3">
                <DayRing day={day} size={48} />
                <div>
                  <p className="text-[15px] font-bold text-bone">{t.day} {day}</p>
                  <p className="text-[12px] text-white/50">{planOf(state) === "free" ? "—" : planOf(state) === "p10" ? t.p10 : t.p30}</p>
                </div>
              </div>
              <nav className="mt-6 flex flex-1 flex-col gap-0.5">
                {menu.map((it) => (
                  <Link
                    key={it.label}
                    href={it.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between rounded-xl px-3 py-3 text-[15px] font-medium text-bone hover:bg-white/[.05]"
                  >
                    {it.label}
                    <span aria-hidden className="text-white/30">›</span>
                  </Link>
                ))}
              </nav>
              <div className="mt-4 flex items-center justify-between border-t border-white/[.08] pt-4">
                <Link href={`/${locale}/logout`} onClick={() => setOpen(false)} className="text-[13px] text-white/60 hover:text-bone">{t.logout}</Link>
                <span className="text-[11px] text-white/30">v2</span>
              </div>
            </aside>
          </div>
        )}
      </div>
    </NavPendingProvider>
  );
}
