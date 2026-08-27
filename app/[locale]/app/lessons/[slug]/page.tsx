import Link from "next/link";
import { notFound } from "next/navigation";
import { getDict } from "@/lib/i18n";
import { getLesson, getLessons } from "@/lib/content/lessons";
import { MarkRead } from "@/components/MarkRead";

export function generateStaticParams() {
  return getLessons("en").map((l) => ({ slug: l.slug }));
}

export default async function LessonPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const t = getDict(locale);
  const lesson = getLesson(locale, slug);
  if (!lesson) notFound();

  return (
    <article className="mx-auto max-w-2xl px-5 py-6 md:py-10">
      <MarkRead slug={slug} locale={locale} />
      <Link
        href={`/${locale}/app/lessons`}
        className="text-[13px] text-mute hover:text-bone"
      >
        &larr; {t.lessons.title}
      </Link>

      <header className="mt-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-faint">
          {t.common.day} {lesson.unlockDay} &middot;{" "}
          {t.lessons.minRead.replace("{n}", String(lesson.minutes))}
        </p>
        <h1 className="mt-2 text-[1.85rem] font-semibold leading-tight tracking-tight md:text-[2.2rem]">
          {lesson.title}
        </h1>
      </header>

      <div className="mt-7 space-y-5">
        {lesson.body.map((p, i) => (
          <p key={i} className="text-[1.05rem] leading-[1.8] text-mute">
            {p}
          </p>
        ))}
      </div>

      <footer className="mt-10 border-t border-ink-700 pt-6">
        <p className="text-[12px] leading-relaxed text-faint">{t.medical.body}</p>
      </footer>
    </article>
  );
}
