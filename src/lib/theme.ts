/**
 * CHOUFPlay v2 — Design System Theme
 * Single source of truth for all visual tokens.
 * Import from here instead of hardcoding values in components.
 */

export const colors = {
  // Backgrounds
  background:    "#07070F",   // fond principal — noir bleuté profond
  surface:       "#FFFFFF08", // glass card — blanc 5% opacity
  surface2:      "#FFFFFF0D", // glass card hover — blanc 8% opacity
  surface3:      "#FFFFFF14", // glass card active — blanc 12% opacity
  surfaceSolid:  "#181825",   // surface opaque (modales, sidebar)
  surfaceSolid2: "#1E1E2E",   // surface opaque hover

  // Brand
  orange:  "#FF6B00",
  orange2: "#FF8C2A",       // orange clair pour dégradés
  gold:    "#C9963A",
  green:   "#22C55E",
  violet:  "#7C5CBF",

  // Borders glass
  borderGlass:  "rgba(255,255,255,0.08)",
  borderGlass2: "rgba(255,255,255,0.14)",

  // Glow overlays (pour radial-gradient)
  glowOrange: "rgba(255,107,0,0.18)",
  glowGold:   "rgba(201,150,58,0.15)",
  glowGreen:  "rgba(34,197,94,0.15)",
  glowViolet: "rgba(124,92,191,0.18)",

  // Text
  text:      "#F0F0FA",
  textMuted: "#A0A0B8",
  textDim:   "#60607A",
  white:     "#FFFFFF",
  black:     "#000000",
} as const;

export const spacing = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const radius = {
  small:  8,
  medium: 12,
  large:  18,   // cartes principales
  pill:   999,  // boutons pill / badges
} as const;

export const typography = {
  xs:  14,
  sm:  18,
  md:  22,
  lg:  28,
  xl:  36,
  xxl: 48,
  /** Minimum font size for TV readability at 3m */
  min: 18,
} as const;

export const effects = {
  // Glassmorphism
  glassBg:     "rgba(255,255,255,0.05)",
  glassBorder: "rgba(255,255,255,0.08)",

  // Glows
  glowOrange: "0 0 30px rgba(255,107,0,0.18)",
  glowGold:   "0 0 20px rgba(201,150,58,0.15)",

  // Focus D-pad TV — bordure orange + halo
  focusRing: "0 0 0 2px #FF6B00, 0 0 25px rgba(255,107,0,0.35)",

  // Card focus (inset glow)
  cardFocusOrange: "0 0 0 1px rgba(255,107,0,0.5), inset 0 0 40px rgba(255,107,0,0.08)",
  cardFocusGold:   "0 0 0 1px rgba(201,150,58,0.4), inset 0 0 40px rgba(201,150,58,0.07)",
  cardFocusViolet: "0 0 0 1px rgba(124,92,191,0.4), inset 0 0 40px rgba(124,92,191,0.08)",

  // Gradient bouton CTA
  gradientOrange: "linear-gradient(90deg, #FF6B00, #FF8C2A)",

  // Ambient background glows (positionnés en absolute)
  ambientTopRight:   "radial-gradient(circle at 80% 10%, rgba(255,107,0,0.06) 0%, transparent 60%)",
  ambientBottomLeft: "radial-gradient(circle at 10% 90%, rgba(124,92,191,0.05) 0%, transparent 60%)",
} as const;

/**
 * Helpers React Native (StyleSheet ne supporte pas les string gradients)
 * Utiliser ces valeurs avec react-native-linear-gradient
 */
export const gradients = {
  orange:     ["#FF6B00", "#FF8C2A"] as const,
  orangeCard: ["rgba(255,107,0,0.18)", "transparent"] as const,
  goldCard:   ["rgba(201,150,58,0.15)", "transparent"] as const,
  violetCard: ["rgba(124,92,191,0.18)", "transparent"] as const,
  topbar:     ["rgba(255,255,255,0.03)", "rgba(255,255,255,0.00)"] as const,
} as const;

const theme = { colors, spacing, radius, typography, effects, gradients } as const;
export default theme;
