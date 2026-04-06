import { useCallback, useEffect, useMemo, useState } from "react";
import {
  TvCounts,
  TvFocusState,
  createInitialTvFocus,
  moveHorizontal,
  moveVertical,
} from "@/lib/tvNavigation";

interface UseTvNavigationOptions {
  counts: TvCounts;
  enabled?: boolean;
  onEnter?: (state: TvFocusState) => void;
  onBack?: () => void;
}

export function useTvNavigation({
  counts,
  enabled = true,
  onEnter,
  onBack,
}: UseTvNavigationOptions) {
  const [focus, setFocus] = useState<TvFocusState>(createInitialTvFocus);

  useEffect(() => {
    setFocus((prev) => ({
      ...prev,
      indices: {
        categories: Math.min(prev.indices.categories, Math.max(0, counts.categories - 1)),
        channels: Math.min(prev.indices.channels, Math.max(0, counts.channels - 1)),
        preview: Math.min(prev.indices.preview, Math.max(0, counts.preview - 1)),
      },
      section:
        counts[prev.section] > 0
          ? prev.section
          : (["categories", "channels", "preview"] as const).find((s) => counts[s] > 0) ?? "categories",
    }));
  }, [counts]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled) return;

      const key = e.key;

      if (
        ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Enter", "Escape", "Backspace"].includes(key)
      ) {
        e.preventDefault();
        e.stopPropagation();
      }

      switch (key) {
        case "ArrowUp":
          setFocus((prev) => moveVertical(prev, "up", counts));
          break;
        case "ArrowDown":
          setFocus((prev) => moveVertical(prev, "down", counts));
          break;
        case "ArrowLeft":
          setFocus((prev) => moveHorizontal(prev, "left", counts));
          break;
        case "ArrowRight":
          setFocus((prev) => moveHorizontal(prev, "right", counts));
          break;
        case "Enter":
          onEnter?.(focus);
          break;
        case "Escape":
        case "Backspace":
          onBack?.();
          break;
      }
    },
    [counts, enabled, focus, onBack, onEnter]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown, { passive: false });
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const selectors = useMemo(
    () => ({
      categories: `[data-tv-section="categories"][data-tv-index="${focus.indices.categories}"]`,
      channels: `[data-tv-section="channels"][data-tv-index="${focus.indices.channels}"]`,
      preview: `[data-tv-section="preview"][data-tv-index="${focus.indices.preview}"]`,
    }),
    [focus]
  );

  useEffect(() => {
    const el = document.querySelector(
      `[data-tv-section="${focus.section}"][data-tv-index="${focus.indices[focus.section]}"]`
    ) as HTMLElement | null;

    if (el) {
      el.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
    }
  }, [focus]);

  return {
    focus,
    setFocus,
    selectors,
    isFocused: (section: keyof TvCounts, index: number) =>
      focus.section === section && focus.indices[section] === index,
  };
}
