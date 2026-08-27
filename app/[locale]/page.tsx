import { redirect } from "next/navigation";

/**
 * No advertorial.
 *
 * The quiz does the agitation far better than a page of prose ever did — it
 * makes him state his own numbers, and every extra screen before it is another
 * place to leave. The ad lands here and goes straight in.
 */
export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}/quiz`);
}
