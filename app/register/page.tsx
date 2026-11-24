import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AuthShell } from "@/components/auth/AuthShell";
import { RegisterForm } from "@/components/auth/AuthForms";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Create an account" };

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const user = await getCurrentUser();
  const { next } = await searchParams;
  if (user) redirect(next && next.startsWith("/") ? next : "/dashboard");

  return (
    <AuthShell
      title="Create your account"
      subtitle="Register once to submit booking requests, track their status and keep your travel details in one place."
      image="/media/gorilla.jpg"
    >
      <RegisterForm next={next} />
    </AuthShell>
  );
}
