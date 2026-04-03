import { useEffect } from "react";

interface ShortcutActions {
  onToggleFavorite?: () => void;
  onBack?: () => void;
  onTogglePlay?: () => void;
  onPrevChannel?: () => void;
  onNextChannel?: () => void;
  onToggleFullscreen?: () => void;
}

export function useKeyboardShortcuts(actions: ShortcutActions) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't trigger if typing in an input
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      switch (e.key) {
        case "F1":
        case "r":
        case "R":
          e.preventDefault();
          actions.onToggleFavorite?.();
          break;
        case "F3":
        case "y":
        case "Y":
          e.preventDefault();
          actions.onBack?.();
          break;
        case " ":
          e.preventDefault();
          actions.onTogglePlay?.();
          break;
        case "ArrowLeft":
          e.preventDefault();
          actions.onPrevChannel?.();
          break;
        case "ArrowRight":
          e.preventDefault();
          actions.onNextChannel?.();
          break;
        case "f":
        case "F":
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            actions.onToggleFullscreen?.();
          }
          break;
        case "Escape":
          actions.onBack?.();
          break;
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [actions]);
}
