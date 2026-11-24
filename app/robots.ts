import type { MetadataRoute } from "next";

export const dynamic = "force-dynamic";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/+$/, "");

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/api/",
          "/dashboard",
          "/login",
          "/register",
          "/forgot-password",
          "/reset-password",
          "/search",
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
