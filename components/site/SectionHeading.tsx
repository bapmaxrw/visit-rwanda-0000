import type { ReactNode } from "react";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  action,
  light = false,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  action?: ReactNode;
  light?: boolean;
}) {
  return (
    <div
      className={`flex flex-col gap-5 md:flex-row md:items-end md:justify-between ${
        align === "center" ? "text-center md:flex-col md:items-center" : ""
      }`}
    >
      <div className={align === "center" ? "max-w-2xl" : "max-w-2xl"}>
        {eyebrow && (
          <p className={`eyebrow mb-3 ${light ? "text-gold-light" : ""}`}>{eyebrow}</p>
        )}
        <h2
          className={`font-display text-3xl leading-[1.12] sm:text-4xl lg:text-[2.7rem] ${
            light ? "text-cream" : "text-pine"
          }`}
        >
          {title}
        </h2>
        {description && (
          <p className={`mt-4 text-[0.95rem] leading-relaxed ${light ? "text-cream/70" : "text-body-soft"}`}>
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
