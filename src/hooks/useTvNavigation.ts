import { useCallback, useEffect, useRef, useState } from "react";
import {
  TvFocusState,
  TvCounts,
  TvSection,
  createInitialTvFocus,
  moveVertical,
  moveHorizontal,
  clamp,
} from "@/lib/tvNavigation";

interface UseTvNavigationOptions {
  counts: TvCounts;
  enabled?: boolean;
  onSelect?: (section: TvSection, index: number) => void;
  onBack?: () => void;
}

export function useTvNavigation({ counts, enabled = true, onSelect, onBack }: UseTvNavigationOptions) {
  const [state, setState] = useState<TvFocusState>(createInitialTvFocus);
  const stateRef = useRef(state);
  stateRef.current = state;
  const countsRef = useRef(counts);
  countsRef.current = counts;

  // Keep indices in bounds when counts change
  useEffect(() => {
    setState(prev => ({
      ...prev,
      indices: {
        categories: clamp(prev.indices.categories, 0, Math.max(0, counts.categories - 1)),
        channels: clamp(prev.indices.channels, 0, Math.max(0, counts.channels - 1)),
        preview: clamp(prev.indices.preview, 0, Math.max(0, counts.preview - 1)),
      },
    }));
  }, [counts.categories, counts.channels, counts.preview]);

  // Scroll focused element into view
  useEffect(() => {
    if (!enabled) return;
    const id = `tv-${state.section}-${state.indices[state.section]}`;
    const el = document.querySelector(`[data-tv-id="${id}"]`) as HTMLElement;
    if (el) el.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [state, enabled]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!enabled) return;
    const tag = (e.target as HTMLElement)?.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA") return;

    const c = countsRef.current;
    const s = stateRef.current;

    switch (e.key) {
      case "ArrowUp":
        e.preventDefault();
        setState(moveVertical(s, "up", c));
        break;
      case "ArrowDown":
        e.preventDefault();
        setState(moveVertical(s, "down", c));
        break;
      case "ArrowLeft":
        e.preventDefault();
        setState(moveHorizontal(s, "left", c));
        break;
      case "ArrowRight":
        e.preventDefault();
        setState(moveHorizontal(s, "right", c));
        break;
      case "Enter":
        e.preventDefault();
        onSelect?.(s.section, s.indices[s.section]);
        break;
      case "Escape":
      case "Backspace":
        e.preventDefault();
        onBack?.();
        break;
    }
  }, [enabled, onSelect, onBack]);

  useEffect(() => {
    if (!enabled) return;
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown, enabled]);

  const setFocus = useCallback((section: TvSection, index: number) => {
    setState(prev => ({ ...prev, section, indices: { ...prev.indices, [section]: index } }));
  }, []);

  return { state, setFocus };
}
