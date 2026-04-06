/**
 * CHOUFPlay v2 — Design System Theme
 * Single source of truth for all visual tokens.
 * Import from here instead of hardcoding values in components.
 *
 * Extrait du code source v1 (AppSidebar, Dashboard, Settings...)
 * Compatible React Native TV + Lovable (web preview)
 */

export const colors = {
  // ─── Backgrounds ───────────────────────────────────────────────
  background:    "#07070F",     // fond principal — noir bleuté profond
  surface:       "#FFFFFF08",   // glass card — blanc 5% opacity
  surface2:      "#FFFFFF0D",   // glass card hover — blanc 8%
  surface3:      "#FFFFFF14",   // glass card active — blanc 12%

  // Surfaces opaques (modales, sidebar, bottom nav)
  surfaceSolid:  "#131318",     // sidebar background opaque (v1: rgba(19,19,24,0.85))
  surfaceSolid2: "#1C1C24",     // hover items sidebar (utilisé dans v1)
  surfaceSolid3: "#242430",     // hover secondaire (v1: hover boutons refresh/delete)

  // ─── Brand ─────────────────────────────────────────────────────
  orange:  "#FF6B00",
  orange2: "#FF8C2A",           // orange clair pour dégradés
  gold:    "#C9963A",
  green:   "#22C55E",
  violet:  "#7C5CBF",
  red:     "#FF3B30",           // déconnexion, erreurs (v1: colors.red)

  // ─── Borders glass ─────────────────────────────────────────────
  borderGlass:   "rgba(255,255,255,0.08)",
  borderGlass2:  "rgba(255,255,255,0.14)",

  // ─── Glow overlays ─────────────────────────────────────────────
  glowOrange: "rgba(255,107,0,0.18)",
  glowGold:   "rgba(201,150,58,0.15)",
  glowGreen:  "rgba(34,197,94,0.15)",
  glowViolet: "rgba(124,92,191,0.18)",

  // ─── Text ──────────────────────────────────────────────────────
  text:      "#F0F0FA",
  textMuted: "#A0A0B8",         // texte secondaire (v1: colors.textMuted)
  textDim:   "#60607A",         // labels section, metadata (v1: colors.textDim)
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
  // ─── Glassmorphism sidebar (extrait v1) ─────────────────────────
  sidebarBg:   "rgba(19,19,24,0.85)",
  sidebarBlur: "blur(20px)",

  // ─── Focus D-pad TV ────────────────────────────────────────────
  focusRing: "0 0 0 2px #FF6B00, 0 0 25px rgba(255,107,0,0.35)",

  // ─── Card glow focus (hero cards dashboard) ────────────────────
  cardFocusOrange: "0 0 0 1px rgba(255,107,0,0.5), inset 0 0 40px rgba(255,107,0,0.08)",
  cardFocusGold:   "0 0 0 1px rgba(201,150,58,0.4), inset 0 0 40px rgba(201,150,58,0.07)",
  cardFocusViolet: "0 0 0 1px rgba(124,92,191,0.4), inset 0 0 40px rgba(124,92,191,0.08)",

  // ─── Nav items (extrait v1 AppSidebar) ──────────────────────────
  navItemActive:      "rgba(255,109,0,0.10)",  // bg item actif
  navItemActiveBadge: "rgba(255,109,0,0.15)",  // badge compteur
  navIconGlow:        "drop-shadow(0 0 4px rgba(255,109,0,0.4))",
  playlistActive:     "rgba(255,109,0,0.06)",  // bg playlist active

  // ─── CTA ────────────────────────────────────────────────────────
  gradientOrange: "linear-gradient(90deg, #FF6B00, #FF8C2A)",

  // ─── Ambient (halos de fond) ────────────────────────────────────
  ambientTopRight:   "radial-gradient(circle at 80% 10%, rgba(255,107,0,0.06) 0%, transparent 60%)",
  ambientBottomLeft: "radial-gradient(circle at 10% 90%, rgba(124,92,191,0.05) 0%, transparent 60%)",
} as const;

/**
 * Gradients pour React Native (react-native-linear-gradient)
 * StyleSheet ne supporte pas les string CSS gradients.
 */
export const gradients = {
  orange:     ["#FF6B00", "#FF8C2A"] as const,
  orangeCard: ["rgba(255,107,0,0.18)", "transparent"] as const,
  goldCard:   ["rgba(201,150,58,0.15)", "transparent"] as const,
  violetCard: ["rgba(124,92,191,0.18)", "transparent"] as const,
  sidebar:    ["rgba(19,19,24,0.95)", "rgba(13,13,20,0.98)"] as const,
} as const;

const theme = { colors, spacing, radius, typography, effects, gradients } as const;
export default theme;
