import React from "react";

interface TvFocusableProps {
  tvId: string;
  focused: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  onDoubleClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
  as?: "button" | "div";
}

/**
 * Wrapper that applies TV focus styling based on the `focused` prop.
 * Uses `data-tv-id` for scroll-into-view targeting.
 */
export const TvFocusable = React.memo(({
  tvId,
  focused,
  children,
  onClick,
  onDoubleClick,
  className = "",
  style = {},
  as = "button",
}: TvFocusableProps) => {
  const focusStyle: React.CSSProperties = focused
    ? {
        boxShadow: "0 0 0 2px #FF6D00, 0 0 15px rgba(255,109,0,0.3)",
        background: "rgba(255,109,0,0.10)",
        ...style,
      }
    : style;

  const Tag = as;

  return (
    <Tag
      data-tv-id={tvId}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      className={`transition-all duration-150 outline-none ${className}`}
      style={focusStyle}
      tabIndex={focused ? 0 : -1}
    >
      {children}
    </Tag>
  );
});

TvFocusable.displayName = "TvFocusable";
