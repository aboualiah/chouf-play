import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { lazy, Suspense, useState, useEffect, useCallback } from "react";
import { I18nContext, getSavedLang, saveLang, Lang, t as tFn } from "@/lib/i18n";
import { useCapacitorBack } from "@/hooks/useCapacitorBack";

const Index = lazy(() => import("./pages/Index"));
const Settings = lazy(() => import("./pages/Settings"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const DemoChannels = lazy(() => import("./pages/DemoChannels"));
const PlaylistManager = lazy(() => import("./pages/PlaylistManager"));
const Premium = lazy(() => import("./pages/Premium"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const NotFound = lazy(() => import("./pages/NotFound"));


const queryClient = new QueryClient();

function PageLoader() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  );
}

function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(getSavedLang);

  useEffect(() => {
    // Apply RTL on mount
    const isRtl = lang === "ar";
    document.documentElement.dir = isRtl ? "rtl" : "ltr";
  }, [lang]);

  const handleSetLang = useCallback((l: Lang) => {
    saveLang(l);
    setLangState(l);
  }, []);

  const t = useCallback((key: string) => tFn(key, lang), [lang]);

  return (
    <I18nContext.Provider value={{ lang, setLang: handleSetLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

function GlobalTVHandlers({ children }: { children: React.ReactNode }) {
  // Official Capacitor back-button listener (native Android TV)
  useCapacitorBack();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.keyCode === 13 || e.keyCode === 23) { // Enter or DPAD_CENTER
        const focused = document.activeElement as HTMLElement;
        if (focused && focused !== document.body && focused.tagName !== "INPUT" && focused.tagName !== "TEXTAREA") {
          e.preventDefault();
          focused.click();
        }
      }
      // Fallback keydown interception for web / WebView without Capacitor plugin
      const isBack = e.key === "Escape" || e.keyCode === 4 || e.keyCode === 10009;
      if (isBack) {
        e.preventDefault();
        window.dispatchEvent(new CustomEvent('chouf-back'));
      }
      if (e.key === "Backspace") {
        const tag = document.activeElement?.tagName;
        if (tag !== "INPUT" && tag !== "TEXTAREA") {
          e.preventDefault();
          window.dispatchEvent(new CustomEvent('chouf-back'));
        }
      }
    };
    window.addEventListener("keydown", handler, { capture: true });
    return () => window.removeEventListener("keydown", handler, { capture: true });
  }, []);

  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <I18nProvider>
      <TooltipProvider>
        <GlobalTVHandlers>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/demo" element={<DemoChannels />} />
                <Route path="/playlists" element={<PlaylistManager />} />
                <Route path="/premium" element={<Premium />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </GlobalTVHandlers>
      </TooltipProvider>
    </I18nProvider>
  </QueryClientProvider>
);

export default App;
