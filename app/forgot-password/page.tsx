import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/AuthShell";
import { ForgotForm } from "@/components/auth/AuthForms";

export const metadata: Metadata = { title: "Reset your password" };

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Forgot your password?"
      subtitle="Enter the email address or telephone number on your account and we will send a reset link. The link expires after one hour."
      image="/media/nyungwe.jpg"
    >
      <ForgotForm />
    </AuthShell>
  );
}
