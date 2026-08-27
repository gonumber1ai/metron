"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getDict, locales, localeNames, type Locale } from "@/lib/i18n";
import { useMetron } from "@/components/useMetron";
import { clearAll } from "@/lib/store";

export function SettingsClient({ locale }: { locale: string }) {
  const t = getDict(locale);
  const router = useRouter();
  const { state, mutate, ready } = useMetron(locale);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!ready) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <p className="text-mute">{t.common.loading}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-5 py-6 md:py-10">
      <h1 className="text-[1.7rem] font-semibold tracking-tight">{t.settings.title}</h1>

      {/* -------------------------------------------------------- language */}
      <section className="mt-6 rounded-2xl card p-5">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-faint">
          {t.settings.language}
        </h2>
        <div className="mt-3 flex gap-2">
          {locales.map((l: Locale) => (
            <button
              key={l}
              type="button"
              onClick={() => router.push(`/${l}/app/settings`)}
              className={`flex-1 rounded-xl border px-4 py-3 text-[0.95rem] font-medium ${
                l === locale
                  ? "border-jade bg-jade-050 text-bone"
                  : "border-ink-600 bg-ink-900 text-mute"
              }`}
            >
              {localeNames[l]}
            </button>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------- privacy */}
      <section className="mt-4 rounded-2xl card p-5">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-faint">
          {t.privacy.title}
        </h2>

        <label className="mt-4 flex items-start justify-between gap-4">
          <span className="min-w-0">
            <span className="block text-[0.96rem] text-bone">{t.settings.pinOn}</span>
            <span className="mt-0.5 block text-[0.86rem] text-faint">{t.privacy.b4}</span>
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={state.pinEnabled}
            onClick={() => mutate((s) => ({ ...s, pinEnabled: !s.pinEnabled }))}
            className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
              state.pinEnabled ? "bg-jade" : "bg-ink-600"
            }`}
          >
            <span
              className={`absolute top-1 h-5 w-5 rounded-full bg-bone transition-transform ${
                state.pinEnabled ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </label>

        <div className="mt-5 border-t border-ink-700 pt-4">
          <p className="text-[0.9rem] font-medium text-bone">{t.settings.notifications}</p>
          <div className="mt-2 rounded-xl border border-jade/30 bg-jade-050 px-4 py-3">
            <p className="text-[0.92rem] font-medium text-jade-300">{t.settings.notifNeutral}</p>
            <p className="mt-1 text-[0.86rem] text-mute">{t.settings.notifNeutralHelp}</p>
          </div>
        </div>

        <ul className="mt-5 space-y-2 border-t border-ink-700 pt-4">
          {[t.privacy.b1, t.privacy.b2, t.privacy.b6].map((b) => (
            <li key={b} className="flex gap-2.5 text-[0.89rem] leading-relaxed text-mute">
              <span aria-hidden className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-jade" />
              {b}
            </li>
          ))}
        </ul>
      </section>

      {/* --------------------------------------------------------- account */}
      <section className="mt-4 rounded-2xl card p-5">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-faint">
          {t.settings.account}
        </h2>

        <label className="mt-4 block">
          <span className="block text-[0.9rem] text-mute">
            {locale === "fr" ? "Pseudo" : "Username"} · {t.common.optional}
          </span>
          <input
            type="text"
            value={state.username ?? ""}
            onChange={(e) => mutate((s) => ({ ...s, username: e.target.value }))}
            placeholder={locale === "fr" ? "Comme vous voulez" : "Anything you like"}
            className="mt-1.5 w-full rounded-xl border border-ink-600 bg-ink-900 px-4 py-3 text-[15px] text-bone placeholder:text-faint focus:border-jade focus:outline-none"
          />
        </label>

        <div className="mt-6 border-t border-ink-700 pt-4">
          {!confirmDelete ? (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="text-[0.93rem] font-medium text-alert hover:underline"
            >
              {t.settings.deleteAccount}
            </button>
          ) : (
            <div className="rounded-xl border border-alert/40 bg-alert/10 p-4">
              <p className="text-[0.93rem] font-medium text-bone">{t.settings.deleteWarn}</p>
              <div className="mt-3 flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="rounded-full border border-ink-600 px-4 py-2.5 text-[14px] text-mute"
                >
                  {t.common.no}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    clearAll();
                    router.push(`/${locale}`);
                  }}
                  className="rounded-full bg-alert px-5 py-2.5 text-[14px] font-semibold text-white"
                >
                  {t.common.yes}
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      <p className="mt-8 text-[12px] leading-relaxed text-faint">{t.medical.body}</p>
    </div>
  );
}
