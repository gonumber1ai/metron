"use client";

import { usePathname, useRouter } from "next/navigation";
import { locales, localeNames, type Locale } from "@/lib/i18n";

export function LocaleSwitch({
  locale,
  tone = "dark",
}: {
  locale: string;
  tone?: "dark" | "light";
}) {
  const pathname = usePathname();
  const router = useRouter();

  function go(next: Locale) {
    if (next === locale) return;
    const rest = pathname.replace(/^\/(en|fr)/, "");
    router.push(`/${next}${rest}`);
  }

  const base =
    tone === "light"
      ? "text-graphite-2 border-rule hover:bg-paper-2"
      : "text-mute border-ink-600 hover:bg-ink-700";
  const active = tone === "light" ? "bg-graphite text-paper" : "bg-jade text-ink-900";

  return (
    <div className="inline-flex rounded-full border overflow-hidden" role="group">
      {locales.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => go(l)}
          aria-current={l === locale ? "true" : undefined}
          className={`px-3 py-1.5 text-xs font-medium transition-colors ${
            l === locale ? active : base
          }`}
        >
          {localeNames[l].slice(0, 2).toUpperCase()}
          <span className="sr-only"> {localeNames[l]}</span>
        </button>
      ))}
    </div>
  );
}
