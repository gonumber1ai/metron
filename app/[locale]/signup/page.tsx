import { AuthForm } from "@/components/app/AuthForm";

export default async function SignupPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return (
    <>
      <style>{`body{background:#070D0F;color:#fff}body::before{display:none}`}</style>
      <AuthForm locale={locale} mode="signup" />
    </>
  );
}
