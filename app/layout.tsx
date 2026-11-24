import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Inter, Playfair_Display } from "next/font/google";
import { and, count, eq } from "drizzle-orm";
import "./globals.css";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { Cursor } from "@/components/site/Cursor";
import { ScrollProgress } from "@/components/site/ScrollProgress";
import { CinematicLayer } from "@/components/site/CinematicLayer";
import { BackToTop } from "@/components/site/BackToTop";
import { getSceneMap } from "@/lib/videos";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { bookings } from "@/lib/db/schema";
import { normalizeTheme, THEME_COOKIE } from "@/lib/themes";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Visit Rwanda Academy — Discover the Beauty of Rwanda",
    template: "%s · Visit Rwanda Academy",
  },
  description:
    "Explore Rwanda's national parks, cultural heritage, tourism leadership and experiences, and submit booking requests with officially verified prices.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  const theme = normalizeTheme((await cookies()).get(THEME_COOKIE)?.value);
  const scenes = await getSceneMap();
  let pendingCount = 0;

  if (user) {
    try {
      const db = await getDb();
      const [row] = await db
        .select({ value: count() })
        .from(bookings)
        .where(and(eq(bookings.userId, user.id), eq(bookings.status, "pending")));
      pendingCount = Number(row?.value ?? 0);
    } catch {
      pendingCount = 0;
    }
  }

  return (
    <html lang="en" data-theme={theme} className={`${inter.variable} ${playfair.variable}`}>
      <body>
        <CinematicLayer scenes={scenes}>
          <ScrollProgress />
          <Cursor />
          <Nav
            user={
              user
                ? { id: user.id, fullName: user.fullName, role: user.role, avatarUrl: user.avatarUrl }
                : null
            }
            pendingCount={pendingCount}
            theme={theme}
          />
          <main className="relative z-10 min-h-screen">{children}</main>
          <Footer />
          <BackToTop />
        </CinematicLayer>
      </body>
    </html>
  );
}
