import { redirect } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { Logo } from "@/components/site/Logo";
import { AdminNav } from "@/components/admin/AdminNav";
import { greetingName } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Administrator" };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=%2Fadmin");
  if (user.role !== "admin") redirect("/dashboard");

  return (
    <div className="min-h-screen bg-surface-muted pt-16">
      <div className="mx-auto flex max-w-[1500px] gap-0 lg:gap-8 lg:px-6 lg:py-8">
        <aside className="hidden w-60 shrink-0 lg:block">
          <div className="sticky top-24 rounded-2xl border border-pine/10 bg-white p-5">
            <Logo compact />
            <p className="mt-6 text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-faint">
              Administration
            </p>
            <AdminNav />
            <div className="mt-6 rounded-xl bg-pine/[0.04] p-3 text-[0.68rem] leading-relaxed text-body-soft">
              <p className="flex items-center gap-1.5 font-semibold text-pine">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald" /> {greetingName(user.fullName, user.role)}
              </p>
              <p className="mt-1">Signed in as administrator.</p>
              <Link href="/dashboard" className="mt-2 inline-block font-semibold text-emerald hover:underline">
                Visitor dashboard →
              </Link>
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1 pb-16">
          <div className="mb-5 flex items-center justify-between gap-3 px-5 pt-2 lg:hidden">
            <Logo compact />
            <Link href="/dashboard" className="text-[0.72rem] font-semibold text-emerald">
              Visitor view →
            </Link>
          </div>
          <div className="mb-4 overflow-x-auto px-5 lg:hidden">
            <AdminNav horizontal />
          </div>
          <div className="px-5 lg:px-0">{children}</div>
        </div>
      </div>
    </div>
  );
}
