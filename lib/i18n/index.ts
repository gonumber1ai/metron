import { en } from "./en";
import { fr } from "./fr";

export const locales = ["en", "fr"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export type Dict = typeof en;

const dicts: Record<Locale, Dict> = { en, fr: fr as unknown as Dict };

export function getDict(locale: string): Dict {
  return dicts[(locale as Locale)] ?? dicts[defaultLocale];
}

export function isLocale(v: string): v is Locale {
  return (locales as readonly string[]).includes(v);
}

export const localeNames: Record<Locale, string> = {
  en: "English",
  fr: "Français",
};
