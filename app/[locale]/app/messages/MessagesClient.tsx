"use client";

import { useState } from "react";
import { getDict } from "@/lib/i18n";
import { useMetron } from "@/components/useMetron";

export function MessagesClient({ locale }: { locale: string }) {
  const t = getDict(locale);
  const { state, mutate, ready } = useMetron(locale);
  const [text, setText] = useState("");

  if (!ready) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <p className="text-mute">{t.common.loading}</p>
      </div>
    );
  }

  function send(e: React.FormEvent) {
    e.preventDefault();
    const body = text.trim();
    if (!body) return;
    mutate((s) => ({
      ...s,
      messages: [
        ...s.messages,
        { id: crypto.randomUUID(), from: "user", text: body, at: new Date().toISOString() },
      ],
    }));
    setText("");
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-8.5rem)] max-w-2xl flex-col px-5 py-6 md:h-[calc(100vh-3rem)] md:py-10">
      <header>
        <h1 className="text-[1.7rem] font-semibold tracking-tight">{t.messages.title}</h1>
        <p className="mt-1.5 text-[0.95rem] text-mute">{t.messages.sub}</p>
      </header>

      <div className="mt-6 flex-1 space-y-3 overflow-y-auto">
        {state.messages.length === 0 ? (
          <div className="grid h-full place-items-center rounded-2xl border border-dashed border-ink-600 px-6 text-center">
            <p className="text-[0.95rem] text-faint">{t.messages.empty}</p>
          </div>
        ) : (
          state.messages.map((m) => (
            <div
              key={m.id}
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-[0.95rem] leading-relaxed ${
                m.from === "user"
                  ? "ml-auto bg-jade text-ink-900"
                  : "mr-auto border border-ink-600 bg-ink-800 text-bone"
              }`}
            >
              {m.text}
            </div>
          ))
        )}
      </div>

      <form onSubmit={send} className="mt-4 flex gap-2.5">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t.messages.placeholder}
          className="flex-1 rounded-xl card px-4 py-3 text-[15px] text-bone placeholder:text-faint focus:border-jade focus:outline-none"
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className="rounded-xl bg-jade px-5 py-3 text-[15px] font-semibold text-ink-900 disabled:opacity-30"
        >
          {t.messages.send}
        </button>
      </form>
    </div>
  );
}
