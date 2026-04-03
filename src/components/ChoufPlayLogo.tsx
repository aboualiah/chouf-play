interface LogoProps {
  size?: number;
  showCP?: boolean;
  animate?: boolean;
  className?: string;
}

export default function ChoufPlayLogo({ size = 120, showCP = true, animate = false, className }: LogoProps) {
  const s = size;
  const r = s * 0.22;
  const tvW = s * 0.58;
  const tvH = s * 0.40;
  const tvX = (s - tvW) / 2;
  const tvY = s * 0.26;
  const tvR = s * 0.06;
  const antLen = s * 0.13;
  const antDot = s * 0.025;
  const playS = s * 0.16;
  const cx = s / 2;
  const cy = tvY + tvH / 2;
  const uid = `logo-${s}-${Math.random().toString(36).slice(2, 6)}`;

  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} className={className}>
      <defs>
        <linearGradient id={`grad-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF6D00" />
          <stop offset="100%" stopColor="#C9A84C" />
        </linearGradient>
        <linearGradient id={`gradGold-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#C9A84C" />
          <stop offset="50%" stopColor="#F5E6B8" />
          <stop offset="100%" stopColor="#C9A84C" />
        </linearGradient>
        <linearGradient id={`gradScreen-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF6D00" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#C9A84C" stopOpacity="0.05" />
        </linearGradient>
        <filter id={`glow-${uid}`}>
          <feGaussianBlur stdDeviation={s * 0.02} result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id={`shadow-${uid}`}>
          <feDropShadow dx="0" dy={s * 0.02} stdDeviation={s * 0.04} floodColor="#FF6D00" floodOpacity="0.3" />
        </filter>
      </defs>

      <rect width={s} height={s} rx={r} fill="#0A0A0F" />
      <rect x="0.5" y="0.5" width={s - 1} height={s - 1} rx={r} fill="none"
        stroke="#C9A84C" strokeWidth="0.5" strokeOpacity="0.15" />
      <ellipse cx={cx} cy={cy} rx={s * 0.3} ry={s * 0.2} fill="#FF6D00" fillOpacity="0.04" />

      {/* Antenna */}
      <line x1={cx} y1={tvY} x2={cx - antLen} y2={tvY - antLen}
        stroke={`url(#gradGold-${uid})`} strokeWidth={Math.max(1.5, s * 0.016)} strokeLinecap="round" />
      <line x1={cx} y1={tvY} x2={cx + antLen} y2={tvY - antLen}
        stroke={`url(#gradGold-${uid})`} strokeWidth={Math.max(1.5, s * 0.016)} strokeLinecap="round" />
      <circle cx={cx - antLen} cy={tvY - antLen} r={antDot} fill="#FF6D00" filter={`url(#glow-${uid})`}>
        {animate && <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite" />}
      </circle>
      <circle cx={cx + antLen} cy={tvY - antLen} r={antDot} fill="#FF6D00" filter={`url(#glow-${uid})`}>
        {animate && <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" />}
      </circle>

      {/* TV Screen */}
      <rect x={tvX} y={tvY} width={tvW} height={tvH} rx={tvR}
        fill="none" stroke={`url(#grad-${uid})`} strokeWidth={Math.max(2.5, s * 0.025)}
        filter={`url(#shadow-${uid})`} />
      <rect x={tvX + s * 0.02} y={tvY + s * 0.02}
        width={tvW - s * 0.04} height={tvH - s * 0.04} rx={tvR * 0.6}
        fill={`url(#gradScreen-${uid})`} />

      {/* Play Button */}
      <polygon
        points={`${cx - playS * 0.45},${cy - playS * 0.55} ${cx - playS * 0.45},${cy + playS * 0.55} ${cx + playS * 0.55},${cy}`}
        fill="#F5F5F7" fillOpacity="0.95" filter={`url(#glow-${uid})`} />

      {/* Stand */}
      <line x1={cx - s * 0.06} y1={tvY + tvH + s * 0.03} x2={cx - s * 0.1} y2={tvY + tvH + s * 0.06}
        stroke="#3A3A42" strokeWidth={Math.max(1.5, s * 0.016)} strokeLinecap="round" />
      <line x1={cx + s * 0.06} y1={tvY + tvH + s * 0.03} x2={cx + s * 0.1} y2={tvY + tvH + s * 0.06}
        stroke="#3A3A42" strokeWidth={Math.max(1.5, s * 0.016)} strokeLinecap="round" />
      <line x1={cx - s * 0.12} y1={tvY + tvH + s * 0.06} x2={cx + s * 0.12} y2={tvY + tvH + s * 0.06}
        stroke="#3A3A42" strokeWidth={Math.max(2, s * 0.018)} strokeLinecap="round" />

      {/* CP Text */}
      {showCP && (
        <>
          <text x={cx - s * 0.075} y={tvY + tvH + s * 0.18}
            fontFamily="'Plus Jakarta Sans', sans-serif"
            fontSize={s * 0.11} fontWeight="800" fill="#FF6D00" textAnchor="middle"
            letterSpacing={-s * 0.003}>C</text>
          <text x={cx + s * 0.065} y={tvY + tvH + s * 0.18}
            fontFamily="'Plus Jakarta Sans', sans-serif"
            fontSize={s * 0.11} fontWeight="300" fill="#86868B" textAnchor="middle"
            letterSpacing={-s * 0.003}>P</text>
        </>
      )}
    </svg>
  );
}
