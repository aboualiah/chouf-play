import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { App } from "@capacitor/app";

/**
 * Official Capacitor back-button listener for Android TV / box.
 * Dispatches the internal 'chouf-back' custom event so all page-level
 * handlers work identically whether triggered by hardware back or keydown.
 *
 * Must be mounted once at the app root (GlobalTVHandlers).
 */
export function useCapacitorBack() {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const listener = App.addListener("backButton", ({ canGoBack }) => {
      // Always dispatch our internal event — never let Capacitor exit
      window.dispatchEvent(new CustomEvent("chouf-back"));
    });

    return () => {
      listener.then((l) => l.remove());
    };
  }, []);
}
