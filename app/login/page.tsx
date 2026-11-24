import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AuthShell } from "@/components/auth/AuthShell";
import { LoginForm } from "@/components/auth/AuthForms";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const user = await getCurrentUser();
  const { next } = await searchParams;
  if (user) redirect(next && next.startsWith("/") ? next : "/dashboard");

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in with your email address or telephone number to manage your profile and booking requests."
      image="/media/kivu.jpg"
    >
      <LoginForm next={next} />
    </AuthShell>
  );
}
