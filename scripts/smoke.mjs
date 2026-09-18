/**
 * HTTP smoke test for the four funnels. No database needed.
 *
 *   node scripts/smoke.mjs                 # against http://localhost:3111
 *   node scripts/smoke.mjs https://metron.life
 *
 * Checks the four routes render with the right price and no privacy copy,
 * that a fifth tier is a 404, and that the offer and recovery APIs refuse
 * what they should. Exit code is the number of failures.
 */
const base = process.argv[2] ?? "http://localhost:3111";
let fails = 0;
const ok = (cond, label) => { console.log(`${cond ? "✔" : "✘"} ${label}`); if (!cond) fails++; };

const PRIVACY = [/besoin de le savoir/i, /No one has to know/i, /100% priv/i, /relev[ée] affiche/i, /statement shows/i];
const NBSP = "[\u00a0\u202f ]";
const priceRe = (n) => new RegExp(String(n).replace(/\B(?=(\d{3})+(?!\d))/g, NBSP) + NBSP + "FCFA");

for (const [path, price] of [["/fr/f/1k", 1000], ["/en/f/1k", 1000], ["/fr/f/5k", 5000], ["/en/f/5k", 5000]]) {
  const r = await fetch(base + path);
  const html = await r.text();
  ok(r.status === 200, `${path} renders`);
  ok(priceRe(price).test(html), `${path} shows ${price} FCFA`);
  ok(!PRIVACY.some((re) => re.test(html)), `${path} has no privacy copy`);
  ok(/f-gold/.test(html), `${path} is gold`);
}
ok((await fetch(base + "/fr/f/9k")).status === 404, "/fr/f/9k is a 404");

const j = (u, body) => fetch(base + u, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
ok((await j("/api/offer", { ref: "abc", funnel: "9k-fr" })).status === 400, "offer API rejects a bad funnel");
ok((await j("/api/offer", { funnel: "1k-fr" })).status === 400, "offer API rejects a missing ref");
ok((await j("/api/admin/recovery", { ref: "abc", channel: "email" })).status === 404, "recovery API is hidden without the admin cookie");
ok((await fetch(base + "/api/track", { method: "POST", body: "{" })).status === 200, "track never errors on junk");

console.log(fails ? `\n${fails} failed` : "\nall passed");
process.exit(fails);
