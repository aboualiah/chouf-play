import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  type TvCounts,
  type TvFocusState,
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

  const countsRef = useRef(counts);
  countsRef.current = counts;

  useEffect(() => {
    setFocus((prev) => {
      const newIndices = {
        categories: Math.min(prev.indices.categories, Math.max(0, counts.categories - 1)),
        channels: Math.min(prev.indices.channels, Math.max(0, counts.channels - 1)),
        preview: Math.min(prev.indices.preview, Math.max(0, counts.preview - 1)),
      };
      const newSection =
        counts[prev.section] > 0
          ? prev.section
          : (["categories", "channels", "preview"] as const).find((s) => counts[s] > 0) ?? "categories";
      // Only update if something actually changed
      if (
        newIndices.categories === prev.indices.categories &&
        newIndices.channels === prev.indices.channels &&
        newIndices.preview === prev.indices.preview &&
        newSection === prev.section
      ) {
        return prev; // Return same reference — no re-render
      }
      return { ...prev, indices: newIndices, section: newSection };
    });
  }, [counts.categories, counts.channels, counts.preview]);

  const onEnterRef = useRef(onEnter);
  onEnterRef.current = onEnter;
  const onBackRef = useRef(onBack);
  onBackRef.current = onBack;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled) return;

      const key = e.key;
      const code = e.keyCode;

      const isBack =
        key === "Escape" ||
        key === "Backspace" ||
        code === 4 ||
        code === 10009;

      if (
        ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Enter"].includes(key) || isBack
      ) {
        e.preventDefault();
        e.stopPropagation();
      }

      if (isBack) {
        onBackRef.current?.();
        return;
      }

      const c = countsRef.current;
      switch (key) {
        case "ArrowUp":
          setFocus((prev) => moveVertical(prev, "up", c));
          break;
        case "ArrowDown":
          setFocus((prev) => moveVertical(prev, "down", c));
          break;
        case "ArrowLeft":
          setFocus((prev) => moveHorizontal(prev, "left", c));
          break;
        case "ArrowRight":
          setFocus((prev) => moveHorizontal(prev, "right", c));
          break;
        case "Enter":
          setFocus((prev) => {
            onEnterRef.current?.(prev);
            return prev;
          });
          break;
      }
    },
    [enabled]
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
