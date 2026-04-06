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

  useEffect(() => {
    if (focused && ref.current) {
      ref.current.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
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
        "transition-all duration-200 outline-none",
        focused && [
          "ring-[3px] ring-[#FF6D00]",
          "scale-[1.04]",
          "shadow-[0_0_0_3px_rgba(255,109,0,0.8),0_0_40px_rgba(255,109,0,0.45),0_0_80px_rgba(255,109,0,0.2)]",
          "z-10",
          "brightness-110",
        ],
        className
      )}
      style={{
        ...style,
        ...(focused ? { filter: "brightness(1.1)" } : {}),
      }}
      tabIndex={focused ? 0 : -1}
    >
      {children}
    </Comp>
  );
}
