import React, { useRef, useEffect } from "react";
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
  const ref = useRef<HTMLElement>(null);

  // When focused, ensure this element has browser focus so scrollIntoView works
  // but do NOT trigger click — only visual focus
  useEffect(() => {
    if (focused && ref.current) {
      ref.current.focus({ preventScroll: false });
    }
  }, [focused]);

  return (
    <Comp
      ref={ref}
      data-tv-section={section}
      data-tv-index={index}
      data-tv-focus={focused ? "true" : "false"}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      className={clsx(
        "transition-all duration-150 outline-none",
        focused && [
          "ring-[3px] ring-[#FF6D00]",
          "scale-[1.03]",
          "shadow-[0_0_0_2px_rgba(255,109,0,0.7),0_0_35px_rgba(255,109,0,0.4),0_0_70px_rgba(255,109,0,0.15)]",
          "z-10",
        ],
        className
      )}
      style={style}
      tabIndex={focused ? 0 : -1}
    >
      {children}
    </Comp>
  );
}
