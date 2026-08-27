import type { Locale } from "@/lib/i18n";
import type { Protocol, ProtocolDay } from "./protocol-types";
import { protocolEn } from "./protocol.en";
import { protocolFr } from "./protocol.fr";

export * from "./protocol-types";

/** The paid trial ends here. Everything above it belongs to the 30-Day Sprint. */
export const TEST_LAST_DAY = 12;
export const SPRINT_LAST_DAY = 30;

export function getProtocol(locale: Locale | string): Protocol {
  return locale === "fr" ? protocolFr : protocolEn;
}

export function getDay(locale: Locale | string, day: number): ProtocolDay | undefined {
  return getProtocol(locale).days.find((d) => d.day === day);
}

export function daysFor(locale: Locale | string, plan: "test" | "sprint"): ProtocolDay[] {
  const all = getProtocol(locale).days;
  return plan === "test" ? all.filter((d) => d.day <= TEST_LAST_DAY) : all;
}

/** Day 0 counts, so the test is 13 entries and the sprint is 31. */
export function totalDays(plan: "test" | "sprint"): number {
  return plan === "test" ? TEST_LAST_DAY : SPRINT_LAST_DAY;
}
