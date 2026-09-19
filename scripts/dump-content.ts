/**
 * Everything a paying man reads inside the app, as one Markdown document.
 *
 *   npx tsx --tsconfig tsconfig.json scripts/dump-content.ts
 *
 * Writes content-dump.en.md and content-dump.fr.md next to package.json.
 * Reads the same files the app reads — protocol, lessons, the app's UI
 * strings — so what comes out is what he sees, not a copy of it.
 */
import fs from "node:fs";
import { getProtocol, TEST_LAST_DAY, SPRINT_LAST_DAY } from "../lib/content/protocol";
import { getLessons } from "../lib/content/lessons";
import { en } from "../lib/i18n/en";
import { fr } from "../lib/i18n/fr";

function dump(locale: "en" | "fr"): string {
  const p = getProtocol(locale);
  const lessons = getLessons(locale);
  const t = locale === "fr" ? fr : en;
  const out: string[] = [];
  const h = (n: number, s: string) => out.push(`${"#".repeat(n)} ${s}`, "");
  const para = (s?: string) => s && out.push(s, "");
  const list = (xs: string[]) => xs.length && out.push(...xs.map((x) => `- ${x}`), "");

  h(1, `METRON — everything inside the app (${locale.toUpperCase()})`);
  para(`10-day programme = Day 0 → Day ${TEST_LAST_DAY}. 30-day programme = Day 0 → Day ${SPRINT_LAST_DAY}.`);
  para(`Days: ${p.days.length}. Lessons: ${lessons.length}. Daily rules: ${p.rules.length}.`);

  // ---------------------------------------------------------------- rules
  h(2, "Daily rules (shown every day)");
  for (const s of p.rulesIntro) para(s);
  for (const r of p.rules) {
    out.push(`**${r.label}**${r.regional ? " _(regional)_" : ""}  `, r.detail, "");
  }

  // ---------------------------------------------------------- measurement
  h(2, "Measurement screen");
  const m = t.measure as Record<string, string>;
  para(`**${m.title}** — ${m.baseline} / ${m.retest}`);
  para(`Mode: ${m.mode} — ${m.modeSolo} / ${m.modePartner}`);
  para(m.modeLocked);
  h(3, `${m.conditions} — Day 1 (baseline)`);
  para(m.condsWhy);
  list([m.baseCond1, m.baseCond2, m.baseCond3]);
  para(m.baseConfirm);
  h(3, `${m.conditions} — Day ${TEST_LAST_DAY} (retest)`);
  list([m.reCond1, m.reCond2, m.reCond3, m.reCond4]);
  para(m.reConfirm);
  h(3, m.howTo);
  list([m.step1, m.step2, m.step3, m.step4]);
  para(m.whyNormal);
  h(3, m.markers);
  list([m.erection, m.energy, m.libido, m.stress, m.sleep, m.stomach, m.control].map((x) => `${x} — ${m.scale}`));

  // ------------------------------------------------------------- app UI
  h(2, "App screen wording");
  const a = t.app as Record<string, string>;
  list(Object.entries(a).map(([k, v]) => `\`${k}\`: ${v}`));
  h(3, "Navigation");
  list(Object.entries(t.nav as Record<string, string>).map(([k, v]) => `\`${k}\`: ${v}`));
  h(3, "Progress");
  list(Object.entries(t.progress as Record<string, string>).map(([k, v]) => `\`${k}\`: ${v}`));
  h(3, "Messages");
  list(Object.entries(t.messages as Record<string, string>).map(([k, v]) => `\`${k}\`: ${v}`));
  h(3, "Settings");
  list(Object.entries(t.settings as Record<string, string>).map(([k, v]) => `\`${k}\`: ${v}`));
  h(3, "Medical notice");
  list(Object.entries(t.medical as Record<string, string>).map(([k, v]) => `\`${k}\`: ${v}`));

  // ---------------------------------------------------------- the days
  h(2, "The programme, day by day");
  let phase = "";
  for (const d of p.days) {
    if (d.phase && d.phase !== phase) {
      phase = d.phase;
      h(3, `PHASE — ${phase}`);
    }
    h(3, `Day ${d.day} — ${d.title}  _(${d.kind}${d.day === TEST_LAST_DAY ? " · end of 10-day" : ""})_`);
    para(`**Focus:** ${d.focus}`);
    if (d.brief.length) {
      h(4, "Brief (what he reads that day)");
      for (const s of d.brief) para(s);
    }
    if (d.session) {
      const s = d.session;
      h(4, `Session — ${s.title}`);
      para(`Duration: ${s.duration} · Ceiling: ${s.ceiling} · Cycles: ${s.cycles}`);
      out.push(...s.steps.map((x, i) => `${i + 1}. ${x}`), "");
      para(`**Ending:** ${s.ending}`);
      if (s.guard) para(`**Guard:** ${s.guard}`);
    }
    if (d.tasks.length) {
      h(4, "Tasks (the checklist)");
      list(d.tasks.map((x) => `[${x.kind}] **${x.label}**${x.detail ? ` — ${x.detail}` : ""}`));
    }
    if (d.lesson) para(`**Lesson unlocked:** \`${d.lesson}\``);
  }

  // ---------------------------------------------------------- lessons
  h(2, "Lessons (the reads)");
  for (const l of [...lessons].sort((x, y) => x.unlockDay - y.unlockDay)) {
    h(3, `${l.title}  _(\`${l.slug}\` · ${l.minutes} min · unlocks Day ${l.unlockDay}${l.regional ? " · regional" : ""})_`);
    for (const s of l.body) para(s);
  }

  return out.join("\n");
}

for (const loc of ["en", "fr"] as const) {
  const file = `content-dump.${loc}.md`;
  fs.writeFileSync(file, dump(loc), "utf8");
  console.log("wrote", file);
}
