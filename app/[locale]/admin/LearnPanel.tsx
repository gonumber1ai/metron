"use client";

export type LearnDayRow = { day: string; campaign: string; arrived: number; signed_up: number };
export type LearnSignup = {
  name: string;
  phone: string;
  email: string;
  locale: string;
  ref: string | null;
  signed_at: string;
  campaign: string | null;
};

/**
 * "Learn test" — the bootcamp signup page.
 *
 * Two questions, in order: how many came and how many left their details,
 * per link per day — and then who they are, newest first, because every row
 * in that second table is a person who was promised a call.
 */
export function LearnPanel({ days, signups }: { days: LearnDayRow[]; signups: LearnSignup[] }) {
  // Fold links into days for the headline numbers; keep the leading link.
  const byDay = new Map<string, { arrived: number; signed_up: number; top: string; topN: number }>();
  for (const r of days) {
    const cur = byDay.get(r.day) ?? { arrived: 0, signed_up: 0, top: "—", topN: 0 };
    cur.arrived += Number(r.arrived ?? 0);
    cur.signed_up += Number(r.signed_up ?? 0);
    if (Number(r.arrived) > cur.topN) {
      cur.topN = Number(r.arrived);
      cur.top = r.campaign === "(none)" ? "untagged" : r.campaign;
    }
    byDay.set(r.day, cur);
  }
  const rows = [...byDay.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1));
  const total = rows.reduce(
    (a, [, r]) => ({ arrived: a.arrived + r.arrived, signed_up: a.signed_up + r.signed_up }),
    { arrived: 0, signed_up: 0 },
  );
  const pct = (n: number, d: number) => (d > 0 ? `${Math.round((n / d) * 100)}%` : "—");

  return (
    <div className="mt-6 space-y-6">
      <section className="rounded-2xl card p-5">
        <p className="text-[11px] font-bold uppercase tracking-wide text-faint">Learn test · bootcamp signups</p>
        {total.arrived === 0 ? (
          <p className="mt-2 text-[1.05rem] leading-relaxed text-mute">
            No one has arrived yet. Send traffic to <span className="metric">/en/learn?c=YOURTAG</span> and this fills in.
          </p>
        ) : (
          <p className="mt-2 text-[1.25rem] font-bold leading-snug text-bone">
            {total.signed_up} signed up from {total.arrived} arrivals — {pct(total.signed_up, total.arrived)}.
          </p>
        )}
      </section>

      {rows.length > 0 && (
        <section className="rounded-2xl card p-5">
          <h2 className="text-[0.95rem] font-bold text-bone">Day by day</h2>
          <p className="mt-0.5 mb-4 text-[12px] text-faint">
            A visitor counts on the day they first landed. Dates are Sydney time.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-[0.88rem]">
              <thead>
                <tr className="text-[11px] uppercase tracking-wide text-faint">
                  <th className="pb-2 pr-4 font-bold">Day</th>
                  <th className="pb-2 pr-4 font-bold">Arrived</th>
                  <th className="pb-2 pr-4 font-bold">Signed up</th>
                  <th className="pb-2 pr-4 font-bold">Led by</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(([day, r]) => (
                  <tr key={day} className="border-t border-ink-700">
                    <td className="metric py-2.5 pr-4 font-bold text-bone">{day}</td>
                    <td className="metric py-2.5 pr-4 text-bone">{r.arrived}</td>
                    <td className="metric py-2.5 pr-4">
                      <span className="font-bold text-jade">{r.signed_up}</span>
                      <span className="ml-1.5 text-[11px] text-faint">{pct(r.signed_up, r.arrived)}</span>
                    </td>
                    <td className="py-2.5 pr-4 text-[12px] text-faint">{r.top}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="rounded-2xl card p-5">
        <h2 className="text-[0.95rem] font-bold text-bone">People to call</h2>
        <p className="mt-0.5 mb-4 text-[12px] text-faint">
          Newest first. Each of these was told a representative will contact them.
        </p>
        {signups.length === 0 ? (
          <p className="text-[0.95rem] text-mute">Nobody yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-[0.88rem]">
              <thead>
                <tr className="text-[11px] uppercase tracking-wide text-faint">
                  <th className="pb-2 pr-4 font-bold">When</th>
                  <th className="pb-2 pr-4 font-bold">Name</th>
                  <th className="pb-2 pr-4 font-bold">Mobile</th>
                  <th className="pb-2 pr-4 font-bold">Email</th>
                  <th className="pb-2 pr-4 font-bold">Link</th>
                </tr>
              </thead>
              <tbody>
                {signups.map((s, i) => (
                  <tr key={`${s.ref ?? i}-${s.signed_at}`} className="border-t border-ink-700">
                    <td className="metric py-2.5 pr-4 text-[12px] text-faint">
                      {String(s.signed_at).replace("T", " ").slice(0, 16)}
                    </td>
                    <td className="py-2.5 pr-4 font-bold text-bone">{s.name}</td>
                    <td className="metric py-2.5 pr-4">
                      <a
                        href={`tel:+61${s.phone}`}
                        className="text-jade underline decoration-jade/40 underline-offset-4 hover:decoration-jade"
                      >
                        0{s.phone}
                      </a>
                      <a
                        href={`https://wa.me/61${s.phone}`}
                        target="_blank"
                        rel="noreferrer"
                        className="ml-2 text-[11px] text-faint underline underline-offset-4 hover:text-bone"
                      >
                        WhatsApp
                      </a>
                    </td>
                    <td className="py-2.5 pr-4 text-mute">{s.email}</td>
                    <td className="py-2.5 pr-4 text-[12px] text-faint">{s.campaign ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
