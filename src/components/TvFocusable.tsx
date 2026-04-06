import React from "react";
import clsx from "clsx";

interface TvFocusableProps extends React.HTMLAttributes<HTMLDivElement> {
  section: "categories" | "channels" | "preview";
  index: number;
  focused: boolean;
  as?: "div" | "button";
  children: React.ReactNode;
}

export function TvFocusable({
  section,
  index,
  focused,
  as = "div",
  children,
  className,
  ...props
}: TvFocusableProps) {
  const Comp = as;
  return (
    <Comp
      data-tv-section={section}
      data-tv-index={index}
      data-tv-focus={focused ? "true" : "false"}
      className={clsx(
        "transition-all duration-150 outline-none",
        focused && "ring-2 ring-orange-500 scale-[1.02] shadow-[0_0_0_1px_rgba(255,109,0,0.35),0_0_24px_rgba(255,109,0,0.18)]",
        className
      )}
      {...props}
    >
      {children}
    </Comp>
  );
}
