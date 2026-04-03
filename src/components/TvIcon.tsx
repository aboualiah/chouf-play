interface TvIconProps {
  size?: number;
  className?: string;
  showPlayButton?: boolean;
  showStand?: boolean;
  showLetters?: boolean;
  animated?: boolean;
}

export function TvIcon({ size = 160, className = "", showPlayButton = false, showStand = true, showLetters = false, animated = false }: TvIconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 160 160" className={className}>
      <defs>
        <linearGradient id="tvGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(24, 100%, 50%)" />
          <stop offset="100%" stopColor="hsl(42, 53%, 54%)" />
        </linearGradient>
        <linearGradient id="tvGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(42, 53%, 54%)" />
          <stop offset="50%" stopColor="#F5E6B8" />
          <stop offset="100%" stopColor="hsl(42, 53%, 54%)" />
        </linearGradient>
        <filter id="tvGlow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Antenna */}
      <g>
        <line x1="80" y1="42" x2="60" y2="20" stroke="url(#tvGold)" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="80" y1="42" x2="100" y2="20" stroke="url(#tvGold)" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="60" cy="18" r="4" fill="hsl(24, 100%, 50%)" filter="url(#tvGlow)">
          {animated && <animate attributeName="opacity" values="1;0.4;1" dur="1.5s" repeatCount="indefinite" />}
        </circle>
        <circle cx="100" cy="18" r="4" fill="hsl(24, 100%, 50%)" filter="url(#tvGlow)">
          {animated && <animate attributeName="opacity" values="0.4;1;0.4" dur="1.5s" repeatCount="indefinite" />}
        </circle>
      </g>

      {/* TV Body */}
      <rect
        x="30" y="42" width="100" height="70" rx="10"
        fill="none" stroke="url(#tvGrad)" strokeWidth="4"
        filter="url(#tvGlow)"
      />
      <rect x="34" y="46" width="92" height="62" rx="7" fill="hsl(24, 100%, 50%)" fillOpacity="0.06" />

      {/* Play button */}
      {showPlayButton && (
        <polygon points="70,62 70,92 96,77" fill="hsl(0, 0%, 96%)" filter="url(#tvGlow)" opacity="0.9" />
      )}

      {/* Stand */}
      {showStand && (
        <g>
          <line x1="70" y1="115" x2="62" y2="122" stroke="hsl(240, 10%, 24%)" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="90" y1="115" x2="98" y2="122" stroke="hsl(240, 10%, 24%)" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="58" y1="122" x2="102" y2="122" stroke="hsl(240, 10%, 24%)" strokeWidth="3" strokeLinecap="round" />
        </g>
      )}

      {/* CP Letters */}
      {showLetters && (
        <g>
          <text x="70" y="148" fontFamily="'Plus Jakarta Sans', sans-serif" fontSize="18" fontWeight="800" fill="hsl(24, 100%, 50%)" textAnchor="middle">C</text>
          <text x="90" y="148" fontFamily="'Plus Jakarta Sans', sans-serif" fontSize="18" fontWeight="300" fill="hsl(240, 5%, 54%)" textAnchor="middle">P</text>
        </g>
      )}
    </svg>
  );
}
