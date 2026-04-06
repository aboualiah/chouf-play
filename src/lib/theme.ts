/**
 * CHOUFPlay v2 — Design System Theme
 * Single source of truth for all visual tokens.
 * Import from here instead of hardcoding values in components.
 */

export const colors = {
  background: "#07070F",
  surface: "#181825",
  surface2: "#1E1E2E",
  orange: "#FF6B00",
  gold: "#C9963A",
  green: "#22C55E",
  violet: "#7C5CBF",
  text: "#F0F0FA",
  textMuted: "#A0A0B8",
  white: "#FFFFFF",
  black: "#000000",
} as const;

export const spacing = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const radius = {
  small: 8,
  medium: 12,
  large: 16,
} as const;

export const typography = {
  xs: 14,
  sm: 18,
  md: 22,
  lg: 28,
  xl: 36,
  /** Minimum font size for TV readability */
  min: 18,
} as const;

export const effects = {
  glowOrange: "0 0 30px rgba(255,107,0,0.18)",
  glowGold: "0 0 20px rgba(201,150,58,0.15)",
  glassmorphism: "rgba(255,255,255,0.08)",
  /** Strong focus glow for TV D-pad navigation */
  focusRing: `0 0 0 3px #FF6B00, 0 0 25px rgba(255,107,0,0.35)`,
} as const;

const theme = { colors, spacing, radius, typography, effects } as const;
export default theme;
