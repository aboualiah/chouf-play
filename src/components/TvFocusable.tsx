import React from "react";
import clsx from "clsx";

interface TvFocusableProps {
  section: "categories" | "channels" | "preview";
  index: number;
  focused: boolean;
  as?: "div" | "button";
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  onDoubleClick?: () => void;
}

export function TvFocusable({
  section,
  index,
  focused,
  as = "div",
  children,
  className,
  style,
  onClick,
  onDoubleClick,
}: TvFocusableProps) {
  const Comp = as as any;
  return (
    <Comp
      data-tv-section={section}
      data-tv-index={index}
      data-tv-focus={focused ? "true" : "false"}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      className={clsx(
        "transition-all duration-150 outline-none",
        focused && "ring-[3px] ring-[#FF6D00] scale-[1.03] shadow-[0_0_0_2px_rgba(255,109,0,0.6),0_0_30px_rgba(255,109,0,0.35),0_0_60px_rgba(255,109,0,0.15)] z-10",
        className
      )}
      style={style}
      tabIndex={focused ? 0 : -1}
    >
      {children}
    </Comp>
  );
}
