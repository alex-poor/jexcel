/** Ported from design/tokens.js.
 * CSS custom properties are the source of truth for colour (see tokens.css).
 * This file exposes a typed view on them for components that need to pass
 * colour values into SVG attributes (where `var(--x)` isn't always usable).
 */

export type ThemeName = "warm" | "neutral";

export interface Theme {
  name: string;
  bg: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  borderStrong: string;
  ink: string;
  ink2: string;
  ink3: string;
  accent: string;
  accentSoft: string;
  accentInk: string;
  cat: [string, string, string, string, string, string, string];
  harm: string;
  harmSoft: string;
  nearMiss: string;
  nearMissSoft: string;
  lag: string;
  closure: string;
  sansFont: string;
  numFont: string;
  monoFont: string;
}

export const THEMES: Record<ThemeName, Theme> = {
  warm: {
    name: "Warm Clinical",
    bg: "#f6f3ee",
    surface: "#ffffff",
    surfaceAlt: "#faf7f2",
    border: "#e6e0d5",
    borderStrong: "#d4ccbc",
    ink: "#1f1b16",
    ink2: "#4a443a",
    ink3: "#7a7264",
    accent: "#0b7a74",
    accentSoft: "#d4ebe9",
    accentInk: "#06514d",
    cat: ["#0b7a74", "#c07a1c", "#6b5ea8", "#3d5a80", "#b8506c", "#8a8070", "#4a7a8c"],
    harm: "#b8621c",
    harmSoft: "#f3dfc8",
    nearMiss: "#0b7a74",
    nearMissSoft: "#d4ebe9",
    lag: "#c07a1c",
    closure: "#0b7a74",
    sansFont: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    numFont: '"Newsreader", "Source Serif 4", Georgia, serif',
    monoFont: '"JetBrains Mono", "SF Mono", ui-monospace, monospace',
  },
  neutral: {
    name: "Neutral Pro",
    bg: "#f7f8fa",
    surface: "#ffffff",
    surfaceAlt: "#fbfcfd",
    border: "#e5e8ed",
    borderStrong: "#cfd4dc",
    ink: "#0f1419",
    ink2: "#3a424d",
    ink3: "#6b7380",
    accent: "#2e5bff",
    accentSoft: "#e1e8ff",
    accentInk: "#1a3ecc",
    cat: ["#2e5bff", "#d97706", "#7c3aed", "#0891b2", "#be123c", "#475569", "#059669"],
    harm: "#d97706",
    harmSoft: "#fde9c7",
    nearMiss: "#2e5bff",
    nearMissSoft: "#e1e8ff",
    lag: "#d97706",
    closure: "#2e5bff",
    sansFont: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    numFont: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    monoFont: '"JetBrains Mono", "SF Mono", ui-monospace, monospace',
  },
};

export function useTheme(name: ThemeName = "warm"): Theme {
  return THEMES[name];
}
