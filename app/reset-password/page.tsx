import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { ResetForm } from "@/components/auth/AuthForms";

export const metadata: Metadata = { title: "Set a new password" };

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <AuthShell
      title="Set a new password"
      subtitle="Choose a strong password you have not used before. All other sessions will be signed out."
      image="/media/canopy.jpg"
    >
      <ResetForm token={token ?? ""} />
    </AuthShell>
  );
}
