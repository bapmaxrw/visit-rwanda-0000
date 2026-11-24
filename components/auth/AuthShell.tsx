import Image from "next/image";
import Link from "next/link";
import { Logo } from "@/components/site/Logo";

export function AuthShell({
  title,
  subtitle,
  image,
  children,
}: {
  title: string;
  subtitle: string;
  image: string;
  children: React.ReactNode;
}) {
  return (
    <section className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      <div className="relative hidden overflow-hidden lg:block">
        <Image src={image} alt="" fill priority sizes="50vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-forest via-forest/55 to-forest/20" />
        <div className="absolute inset-x-0 bottom-0 p-12">
          <Logo light />
          <h2 className="mt-8 max-w-md font-display text-4xl leading-tight text-cream">
            A digital gateway to Rwanda’s tourism and cultural experiences
          </h2>
          <p className="mt-4 max-w-sm text-[0.85rem] leading-relaxed text-cream/65">
            One account to plan visits, track booking requests and keep your details secure.
          </p>
          <div className="mt-8 flex gap-6 text-[0.68rem] uppercase tracking-[0.18em] text-cream/50">
            <span>Gorilla trekking</span>
            <span>Lake Kivu</span>
            <span>Heritage</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center bg-cream px-5 py-24 sm:px-10">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          <p className="eyebrow">Visit Rwanda Academy</p>
          <h1 className="mt-2 font-display text-3xl text-pine sm:text-[2.4rem]">{title}</h1>
          <p className="mt-3 text-[0.88rem] leading-relaxed text-body-soft">{subtitle}</p>
          <div className="mt-8">{children}</div>
          <p className="mt-8 text-center text-[0.68rem] text-faint">
            <Link href="/" className="hover:text-emerald">
              ← Back to the website
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
