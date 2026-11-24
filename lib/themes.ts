/**
 * Colour themes. Each id maps to a block of palette variables in `app/globals.css`
 * (`html[data-theme="<id>"]`); the variables override the ones Tailwind generates,
 * so a theme restyles the whole site without any component changes.
 */
export const THEME_COOKIE = "vr_theme";

export const THEMES = [
  {
    id: "emerald",
    label: "Rwanda Emerald",
    hint: "Forest green & gold",
    swatch: ["#06231c", "#12775a", "#c9a44c"],
  },
  {
    id: "volcano",
    label: "Volcano Dusk",
    hint: "Basalt & ember",
    swatch: ["#1f1410", "#96401f", "#d9a13f"],
  },
  {
    id: "kivu",
    label: "Lake Kivu",
    hint: "Deep water blues",
    swatch: ["#071e2a", "#0f6478", "#d3b26a"],
  },
  {
    id: "savanna",
    label: "Savanna Gold",
    hint: "Olive & ochre",
    swatch: ["#241a10", "#7a5a12", "#c98f2c"],
  },
  {
    id: "amahoro",
    label: "Amahoro Violet",
    hint: "Peace violet & gold",
    swatch: ["#1a1030", "#5c3b91", "#d4a94c"],
  },
] as const;

export type ThemeId = (typeof THEMES)[number]["id"];

export const DEFAULT_THEME: ThemeId = "emerald";

export function normalizeTheme(value?: string | null): ThemeId {
  return THEMES.some((theme) => theme.id === value) ? (value as ThemeId) : DEFAULT_THEME;
}
