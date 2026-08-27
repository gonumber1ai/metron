"use client";

/**
 * The arousal scale, written so a man can follow it without asking anyone.
 *
 * "Name your number" was useless on its own — it assumed he already knew what
 * the numbers felt like. Every level here is anchored to a physical sign he
 * can actually notice in the moment, and 6 is spelled out in detail because
 * finding 6 is the entire skill.
 */

type Level = {
  n: string;
  feel: string[];
  action: string;
  tone: "ok" | "stop" | "high" | "late";
};

const EN: Level[] = [
  {
    n: "1–4",
    feel: ["Turned on, but nothing is building.", "Breathing normal.", "You could stop and hold a conversation."],
    action: "Keep going",
    tone: "ok",
  },
  {
    n: "5",
    feel: ["Fully hard and comfortable.", "No tightness anywhere.", "Nothing is pulling."],
    action: "Keep going",
    tone: "ok",
  },
  {
    n: "6",
    feel: [
      "Your breathing gets shorter without you deciding to.",
      "A small tightening underneath, behind the balls.",
      "It starts to feel like it is moving on its own.",
      "You feel the first pull at the base.",
    ],
    action: "STOP HERE",
    tone: "stop",
  },
  {
    n: "7",
    feel: ["A clear building or pulling at the base.", "Stomach or thighs begin to tighten.", "You have to concentrate to stay level."],
    action: "Already too high — stop",
    tone: "high",
  },
  {
    n: "8",
    feel: ["You are working to hold it.", "Toes curl, breath held, body tight.", "It takes effort not to finish."],
    action: "Far too high",
    tone: "high",
  },
  {
    n: "9",
    feel: ["The 'I'm about to' feeling.", "Point of no return."],
    action: "Too late. It is happening.",
    tone: "late",
  },
];

const FR: Level[] = [
  {
    n: "1–4",
    feel: ["Excité, mais rien ne monte.", "Respiration normale.", "Vous pourriez vous arrêter et tenir une conversation."],
    action: "Continuez",
    tone: "ok",
  },
  {
    n: "5",
    feel: ["Bien dur et à l'aise.", "Aucune tension nulle part.", "Rien ne tire."],
    action: "Continuez",
    tone: "ok",
  },
  {
    n: "6",
    feel: [
      "Votre respiration se raccourcit sans que vous le décidiez.",
      "Un petit serrement en dessous, derrière les testicules.",
      "Ça commence à avancer tout seul.",
      "Vous sentez la première traction à la base.",
    ],
    action: "ARRÊTEZ ICI",
    tone: "stop",
  },
  {
    n: "7",
    feel: ["Une montée nette à la base.", "Le ventre ou les cuisses commencent à se serrer.", "Vous devez vous concentrer pour rester stable."],
    action: "Déjà trop haut — arrêtez",
    tone: "high",
  },
  {
    n: "8",
    feel: ["Vous luttez pour tenir.", "Orteils crispés, souffle bloqué, corps tendu.", "Il faut un effort pour ne pas finir."],
    action: "Beaucoup trop haut",
    tone: "high",
  },
  {
    n: "9",
    feel: ["La sensation « ça y est ».", "Point de non-retour."],
    action: "Trop tard. C'est parti.",
    tone: "late",
  },
];

const TONES: Record<Level["tone"], string> = {
  ok: "border-ink-600 bg-ink-850",
  stop: "border-jade bg-jade-050",
  high: "border-amber/50 bg-amber-050",
  late: "border-alert/40 bg-alert/10",
};

const NUM: Record<Level["tone"], string> = {
  ok: "bg-ink-700 text-mute",
  stop: "bg-jade text-ink-900",
  high: "bg-amber text-ink-900",
  late: "bg-alert text-white",
};

export function ScaleCard({ locale, compact = false }: { locale: string; compact?: boolean }) {
  const fr = locale === "fr";
  const levels = fr ? FR : EN;

  return (
    <div className="rounded-2xl card p-5">
      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-jade">
        {fr ? "L'échelle" : "The scale"}
      </p>

      {!compact && (
        <p className="mt-2 text-[0.95rem] leading-relaxed text-mute">
          {fr
            ? "Dès que vous commencez, comptez dans votre tête : 3… 4… 5… Dès que vous sentez UN SEUL des signes du 6, arrêtez. N'attendez pas d'être sûr."
            : "From the second you start, count in your head: 3… 4… 5… The moment you feel ANY ONE of the signs at 6, stop. Do not wait until you are sure."}
        </p>
      )}

      <div className="mt-4 space-y-2">
        {levels.map((l) => (
          <div key={l.n} className={`rounded-xl border p-3.5 ${TONES[l.tone]}`}>
            <div className="flex items-start gap-3">
              <span
                className={`metric grid h-9 w-11 shrink-0 place-items-center rounded-lg text-[15px] font-bold ${NUM[l.tone]}`}
              >
                {l.n}
              </span>
              <div className="min-w-0 flex-1">
                <ul className="space-y-1">
                  {l.feel.map((f) => (
                    <li key={f} className="text-[0.9rem] leading-snug text-bone">
                      {f}
                    </li>
                  ))}
                </ul>
                <p
                  className={`mt-2 text-[0.85rem] font-bold uppercase tracking-wide ${
                    l.tone === "stop"
                      ? "text-jade"
                      : l.tone === "late"
                        ? "text-alert"
                        : l.tone === "high"
                          ? "text-amber"
                          : "text-faint"
                  }`}
                >
                  {l.action}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {!compact && (
        <p className="mt-4 rounded-xl border-l-2 border-jade bg-ink-900/50 px-4 py-3 text-[0.9rem] leading-relaxed text-mute">
          {fr
            ? "La plupart des hommes n'ont jamais remarqué le 6. C'est tout le problème. Les deux premières séances servent uniquement à le trouver — pas à durer."
            : "Most men have never noticed 6. That is the whole problem. The first two sessions are only about finding it — not about lasting."}
        </p>
      )}
    </div>
  );
}
