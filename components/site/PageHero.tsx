import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SceneSetter } from "./SceneSetter";
import type { SceneKey } from "@/lib/video-scenes";

/**
 * Page hero that reveals the persistent cinematic layer behind its copy, so the
 * background film is continuous from page to page and while scrolling.
 */
export function PageHero({
  eyebrow,
  title,
  description,
  scene,
  cta,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  scene?: SceneKey;
  cta?: { href: string; label: string };
  children?: React.ReactNode;
}) {
  return (
    <section className="relative flex min-h-[62vh] items-end overflow-hidden pb-14 pt-36 sm:min-h-[68vh]">
      {scene && <SceneSetter scene={scene} />}
      <div
        className="absolute inset-0 bg-gradient-to-t from-forest via-forest/55 to-forest/20"
        aria-hidden="true"
      />
      <div className="container-x relative z-10">
        <div className="max-w-3xl animate-fade-up">
          {eyebrow && (
            <p className="mb-3 text-[0.68rem] font-semibold uppercase tracking-[0.32em] text-gold-light">
              {eyebrow}
            </p>
          )}
          <h1 className="font-display text-4xl leading-[1.08] text-cream sm:text-5xl lg:text-[3.8rem]">
            {title}
          </h1>
          {description && (
            <p className="mt-5 max-w-2xl text-[0.98rem] leading-relaxed text-cream/75">{description}</p>
          )}
          {cta && (
            <Link href={cta.href} className="btn btn-gold mt-7">
              {cta.label} <ArrowRight className="h-4 w-4" />
            </Link>
          )}
          {children}
        </div>
      </div>
    </section>
  );
}
