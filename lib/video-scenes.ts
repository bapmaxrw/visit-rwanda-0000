/**
 * Cinematic scene registry — shared by the server (layout/admin) and the
 * persistent browser layer. Plain data only: safe to import in client code.
 */
export type SceneKey = "home" | "destinations" | "culture" | "leadership" | "developers" | "gallery";

export type SceneMedia = {
  video: string;
  poster: string;
  title: string;
};

export type SceneMap = Record<SceneKey, SceneMedia>;

export const SCENE_ORDER: SceneKey[] = [
  "home",
  "destinations",
  "culture",
  "leadership",
  "developers",
  "gallery",
];

export const SCENE_LABELS: Record<SceneKey, string> = {
  home: "Home · Rwanda aerial",
  destinations: "Destinations · Parks, lakes and mountains",
  culture: "Culture · Heritage and performance",
  leadership: "Leadership · Institutions and conservation",
  developers: "Development · Digital innovation",
  gallery: "Gallery · Rwanda cinematography",
};

export const SCENES: SceneMap = {
  home: {
    video: "/media/hero.mp4",
    poster: "/media/hero-poster.jpg",
    title: "The land of a thousand hills",
  },
  destinations: {
    video: "/media/destinations.mp4",
    poster: "/media/destinations-poster.jpg",
    title: "National parks, lakes and mountains",
  },
  culture: {
    video: "/media/culture.mp4",
    poster: "/media/culture-poster.jpg",
    title: "Heritage, dance and living craft",
  },
  leadership: {
    video: "/media/leadership.mp4",
    poster: "/media/leadership-poster.jpg",
    title: "Institutions and conservation",
  },
  developers: {
    video: "/media/developers.mp4",
    poster: "/media/developers-poster.jpg",
    title: "Software, data and digital innovation",
  },
  gallery: {
    video: "/media/gallery.mp4",
    poster: "/media/gallery-poster.jpg",
    title: "Rwanda, frame by frame",
  },
};

/** Longest-prefix match, so nested routes inherit their section's scene. */
const ROUTE_SCENES: [string, SceneKey][] = [
  ["/development-team", "developers"],
  ["/destinations", "destinations"],
  ["/national-parks", "destinations"],
  ["/booking", "destinations"],
  ["/gallery", "gallery"],
  ["/culture", "culture"],
  ["/about", "leadership"],
  ["/representatives", "leadership"],
  ["/contact", "leadership"],
  ["/articles", "gallery"],
  ["/services", "destinations"],
];

export function sceneForPath(pathname: string): SceneKey | null {
  if (pathname === "/") return "home";
  const match = ROUTE_SCENES.find(
    ([prefix]) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
  return match ? match[1] : null;
}

/** Routes that should never render a cinematic background. */
export function isCinematicRoute(pathname: string): boolean {
  const quiet = ["/admin", "/dashboard", "/login", "/register", "/forgot-password", "/reset-password"];
  return !quiet.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}
