"use client";

import { useEffect } from "react";
import { update } from "@/lib/store";

/** Records that a lesson was opened, so the "New" badge clears in the list. */
export function MarkRead({ slug, locale }: { slug: string; locale: string }) {
  useEffect(() => {
    update(
      (s) =>
        s.readLessons.includes(slug)
          ? s
          : { ...s, readLessons: [...s.readLessons, slug] },
      locale,
    );
  }, [slug, locale]);

  return null;
}
