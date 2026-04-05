import { useEffect, useCallback, useState } from "react";

interface ShortcutActions {
  onToggleFavorite?: () => void;
  onBack?: () => void;
  onTogglePlay?: () => void;
  onPrevChannel?: () => void;
  onNextChannel?: () => void;
  onToggleFullscreen?: () => void;
  onShowEpg?: () => void;
  onShowPlaylists?: () => void;
  onShowSettings?: () => void;
}

/** Which color button was last pressed — used for visual pulse feedback */
export type ColorFlash = "red" | "green" | "yellow" | "blue" | null;

export function useKeyboardShortcuts(actions: ShortcutActions) {
  const [colorFlash, setColorFlash] = useState<ColorFlash>(null);

  const flash = useCallback((color: ColorFlash) => {
    setColorFlash(color);
    setTimeout(() => setColorFlash(null), 300);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      // Android TV physical color buttons (keyCode based)
      const kc = e.keyCode;
      if (kc === 183 || kc === 403) { e.preventDefault(); flash("red"); actions.onToggleFavorite?.(); return; }
      if (kc === 184 || kc === 404) { e.preventDefault(); flash("green"); actions.onShowEpg?.(); return; }
      if (kc === 185 || kc === 405) { e.preventDefault(); flash("yellow"); actions.onShowPlaylists?.(); return; }
      if (kc === 186 || kc === 406) { e.preventDefault(); flash("blue"); actions.onShowSettings?.(); return; }

      switch (e.key) {
        case "F1":
        case "r":
        case "R":
          e.preventDefault();
          flash("red");
          actions.onToggleFavorite?.();
          break;
        case "F2":
        case "g":
        case "G":
          e.preventDefault();
          flash("green");
          actions.onShowEpg?.();
          break;
        case "F3":
        case "y":
        case "Y":
          e.preventDefault();
          flash("yellow");
          actions.onShowPlaylists?.();
          break;
        case "F4":
        case "b":
        case "B":
          e.preventDefault();
          flash("blue");
          actions.onShowSettings?.();
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
  }, [actions, flash]);

  return { colorFlash };
}
