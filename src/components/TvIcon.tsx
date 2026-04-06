import { colors, effects } from "@/lib/theme";
interface TvIconProps {
  size?: number;
  className?: string;
}

export function TvIcon({ size = 108, className = "" }: TvIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 108 108" className={className}>
      <defs>
        <linearGradient id="tvGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={colors.orange} />
          <stop offset="100%" stopColor={colors.gold} />
        </linearGradient>
      </defs>
      {/* TV Body */}
      <path d="M30,35h48c3,0 5,2 5,5v30c0,3 -2,5 -5,5h-48c-3,0 -5,-2 -5,-5v-30c0,-3 2,-5 5,-5z" fill="url(#tvGrad)" />
      {/* Screen */}
      <path d="M33,39h42c1.5,0 2.5,1 2.5,2.5v23c0,1.5 -1,2.5 -2.5,2.5h-42c-1.5,0 -2.5,-1 -2.5,-2.5v-23c0,-1.5 1,-2.5 2.5,-2.5z" fill={colors.background} />
      {/* Play Button */}
      <path d="M50,46l10,7l-10,7z" fill="#FFFFFF" />
      {/* Antenna Left */}
      <line x1="46" y1="35" x2="38" y2="23" stroke={colors.orange} strokeWidth="2" />
      {/* Antenna Right */}
      <line x1="62" y1="35" x2="70" y2="23" stroke={colors.orange} strokeWidth="2" />
      {/* Antenna Tips */}
      <circle cx="38" cy="23" r="2" fill={colors.gold} />
      <circle cx="70" cy="23" r="2" fill={colors.orange} />
      {/* Stand */}
      <line x1="42" y1="75" x2="66" y2="75" stroke={colors.textMuted} strokeWidth="2" />
      <line x1="48" y1="75" x2="48" y2="72" stroke={colors.textMuted} strokeWidth="2" />
      <line x1="60" y1="75" x2="60" y2="72" stroke={colors.textMuted} strokeWidth="2" />
    </svg>
  );
}
