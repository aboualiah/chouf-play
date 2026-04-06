import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { TvZone, TvNavState, navigate, getFocusedItemId, getFocusedZoneId } from "@/lib/tvNavigation";

interface UseTvNavigationOptions {
  zones: TvZone[];
  enabled?: boolean;
  onSelect?: (zoneId: string, itemId: string, itemIndex: number) => void;
  onBack?: () => void;
}

export function useTvNavigation({ zones, enabled = true, onSelect, onBack }: UseTvNavigationOptions) {
  const [state, setState] = useState<TvNavState>({ zoneIndex: 0, itemIndex: 0 });
  const stateRef = useRef(state);
  stateRef.current = state;

  const zonesRef = useRef(zones);
  zonesRef.current = zones;

  // Keep itemIndex in bounds when zones change
  useEffect(() => {
    setState(prev => {
      const zone = zones[prev.zoneIndex];
      if (!zone) return { zoneIndex: 0, itemIndex: 0 };
      if (prev.itemIndex >= zone.items.length) {
        return { ...prev, itemIndex: Math.max(0, zone.items.length - 1) };
      }
      return prev;
    });
  }, [zones]);

  const focusedItemId = useMemo(() => getFocusedItemId(state, zones), [state, zones]);
  const focusedZoneId = useMemo(() => getFocusedZoneId(state, zones), [state, zones]);

  // Scroll focused element into view
  useEffect(() => {
    if (!focusedItemId) return;
    const el = document.querySelector(`[data-tv-id="${focusedItemId}"]`) as HTMLElement;
    if (el) {
      el.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [focusedItemId]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!enabled) return;
    const tag = (e.target as HTMLElement)?.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA") return;

    const z = zonesRef.current;
    const s = stateRef.current;

    switch (e.key) {
      case "ArrowUp":
        e.preventDefault();
        setState(navigate(s, "up", z));
        break;
      case "ArrowDown":
        e.preventDefault();
        setState(navigate(s, "down", z));
        break;
      case "ArrowLeft":
        e.preventDefault();
        setState(navigate(s, "left", z));
        break;
      case "ArrowRight":
        e.preventDefault();
        setState(navigate(s, "right", z));
        break;
      case "Enter": {
        e.preventDefault();
        const zoneId = getFocusedZoneId(s, z);
        const itemId = getFocusedItemId(s, z);
        if (zoneId && itemId) {
          onSelect?.(zoneId, itemId, s.itemIndex);
        }
        break;
      }
      case "Escape":
      case "Backspace":
        // Only handle if not in an input
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

  const setFocus = useCallback((zoneIndex: number, itemIndex: number) => {
    setState({ zoneIndex, itemIndex });
  }, []);

  return {
    state,
    focusedItemId,
    focusedZoneId,
    setFocus,
  };
}
