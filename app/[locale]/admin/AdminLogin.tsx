"use client";

import { useState } from "react";
import { Logo } from "@/components/Logo";

export function AdminLogin() {
  const [password, setPassword] = useState("");
  const [bad, setBad] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setBad(false);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) window.location.reload();
      else setBad(true);
    } catch {
      setBad(true);
    }
    setBusy(false);
  }

  return (
    <>
      <style>{`body{background:var(--color-ink-900);color:var(--color-bone)}`}</style>
      <main className="grid min-h-screen place-items-center px-5">
        <form onSubmit={submit} className="w-full max-w-xs">
          <span className="mb-8 inline-flex">
            <Logo size="sm" />
          </span>
          <input
            type="password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full rounded-xl border-2 border-ink-600 bg-ink-900 px-4 py-3.5 text-[1rem] text-bone placeholder:text-faint focus:border-jade focus:outline-none"
          />
          {bad && <p className="mt-2 text-[0.85rem] text-alert">Not recognised.</p>}
          <button
            type="submit"
            disabled={busy}
            className="mt-3 w-full rounded-2xl btn-go py-3.5 text-[1rem] font-bold disabled:opacity-40"
          >
            {busy ? "…" : "Enter"}
          </button>
        </form>
      </main>
    </>
  );
}
