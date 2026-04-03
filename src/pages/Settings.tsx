import { useState, useEffect } from "react";
import { ArrowLeft, Trophy, Monitor, Shield, Info, Globe, Mail, Code, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SETTINGS_KEY = "chouf_settings";

export interface MatchSettings {
  showBanner: boolean;
  competitions: Record<string, boolean>;
}

const DEFAULT_COMPETITIONS: Record<string, boolean> = {
  "Champions League": true,
  "Ligue 1": true,
  "Premier League": true,
  "La Liga": true,
  "Serie A": false,
  "Bundesliga": false,
  "Botola Pro": false,
  "NBA": true,
  "Roland Garros": false,
  "UFC": false,
  "Six Nations": false,
};

export function getMatchSettings(): MatchSettings {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return { showBanner: true, competitions: { ...DEFAULT_COMPETITIONS } };
}

function saveMatchSettings(s: MatchSettings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
}

const FOOTBALL_COMPS = ["Champions League", "Ligue 1", "Premier League", "La Liga", "Serie A", "Bundesliga", "Botola Pro"];
const OTHER_COMPS = ["NBA", "Roland Garros", "UFC", "Six Nations"];

export default function Settings() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<MatchSettings>(getMatchSettings());
  const [activeSection, setActiveSection] = useState<string>("matchs");

  useEffect(() => {
    saveMatchSettings(settings);
  }, [settings]);

  const toggleComp = (comp: string) => {
    setSettings(prev => ({
      ...prev,
      competitions: { ...prev.competitions, [comp]: !prev.competitions[comp] },
    }));
  };

  const selectAll = () => {
    const comps: Record<string, boolean> = {};
    [...FOOTBALL_COMPS, ...OTHER_COMPS].forEach(c => (comps[c] = true));
    setSettings(prev => ({ ...prev, competitions: comps }));
  };

  const deselectAll = () => {
    const comps: Record<string, boolean> = {};
    [...FOOTBALL_COMPS, ...OTHER_COMPS].forEach(c => (comps[c] = false));
    setSettings(prev => ({ ...prev, competitions: comps }));
  };

  const CompButton = ({ name }: { name: string }) => (
    <button
      onClick={() => toggleComp(name)}
      className={`rounded-lg px-3 py-2 text-xs font-medium transition-all ${
        settings.competitions[name]
          ? "bg-primary/20 text-primary border border-primary/30"
          : "bg-secondary text-muted-foreground border border-transparent hover:border-border"
      }`}
    >
      {name}
    </button>
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-card/80 backdrop-blur-sm px-4 py-3 sm:px-6">
        <button onClick={() => navigate("/")} className="rounded-lg bg-secondary p-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-lg font-bold text-foreground">Paramètres</h1>
      </header>

      <div className="mx-auto max-w-2xl p-4 sm:p-6 space-y-6">
        {/* Match & Sports */}
        <section className="rounded-xl border border-border bg-card overflow-hidden">
          <button
            onClick={() => setActiveSection(activeSection === "matchs" ? "" : "matchs")}
            className="flex w-full items-center gap-3 p-4 text-left hover:bg-secondary/50 transition-colors"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15">
              <Trophy size={18} className="text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">Matchs & Sports</p>
              <p className="text-[11px] text-muted-foreground">Configurer la bannière et les compétitions</p>
            </div>
          </button>

          {activeSection === "matchs" && (
            <div className="border-t border-border p-4 space-y-4">
              {/* Toggle banner */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground">Afficher la bannière matchs</p>
                  <p className="text-[11px] text-muted-foreground">Carousel de matchs en haut de la page Live</p>
                </div>
                <button
                  onClick={() => setSettings(prev => ({ ...prev, showBanner: !prev.showBanner }))}
                  className={`relative h-6 w-11 rounded-full transition-colors ${settings.showBanner ? "bg-primary" : "bg-secondary"}`}
                >
                  <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-foreground transition-transform ${settings.showBanner ? "left-[22px]" : "left-0.5"}`} />
                </button>
              </div>

              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Compétitions à afficher</p>

              {/* Quick actions */}
              <div className="flex gap-2">
                <button onClick={selectAll} className="rounded-lg bg-secondary px-3 py-1.5 text-[11px] font-medium text-foreground hover:bg-muted transition-colors">
                  ✓ Tout sélectionner
                </button>
                <button onClick={deselectAll} className="rounded-lg bg-secondary px-3 py-1.5 text-[11px] font-medium text-muted-foreground hover:bg-muted transition-colors">
                  ✕ Tout désélectionner
                </button>
              </div>

              {/* Football */}
              <div>
                <p className="text-xs font-medium text-foreground mb-2">⚽ Football</p>
                <div className="flex flex-wrap gap-2">
                  {FOOTBALL_COMPS.map(c => <CompButton key={c} name={c} />)}
                </div>
              </div>

              {/* Others */}
              <div>
                <p className="text-xs font-medium text-foreground mb-2">🏅 Autres sports</p>
                <div className="flex flex-wrap gap-2">
                  {OTHER_COMPS.map(c => <CompButton key={c} name={c} />)}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Display */}
        <section className="rounded-xl border border-border bg-card overflow-hidden">
          <button
            onClick={() => setActiveSection(activeSection === "display" ? "" : "display")}
            className="flex w-full items-center gap-3 p-4 text-left hover:bg-secondary/50 transition-colors"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-info/15">
              <Monitor size={18} className="text-info" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">Affichage</p>
              <p className="text-[11px] text-muted-foreground">Thème et interface</p>
            </div>
          </button>
          {activeSection === "display" && (
            <div className="border-t border-border p-4">
              <p className="text-sm text-muted-foreground">Thème sombre activé (par défaut)</p>
            </div>
          )}
        </section>

        {/* Parental Control */}
        <section className="rounded-xl border border-border bg-card overflow-hidden">
          <button
            onClick={() => setActiveSection(activeSection === "parental" ? "" : "parental")}
            className="flex w-full items-center gap-3 p-4 text-left hover:bg-secondary/50 transition-colors"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-warning/15">
              <Shield size={18} className="text-warning" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">Contrôle parental</p>
              <p className="text-[11px] text-muted-foreground">Restrictions et code PIN</p>
            </div>
          </button>
          {activeSection === "parental" && (
            <div className="border-t border-border p-4">
              <p className="text-sm text-muted-foreground">Aucune restriction configurée</p>
            </div>
          )}
        </section>

        {/* About */}
        <section className="rounded-xl border border-border bg-card overflow-hidden">
          <button
            onClick={() => setActiveSection(activeSection === "about" ? "" : "about")}
            className="flex w-full items-center gap-3 p-4 text-left hover:bg-secondary/50 transition-colors"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/15">
              <Info size={18} className="text-accent" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-foreground">À propos</p>
              <p className="text-[11px] text-muted-foreground">Informations sur l'application</p>
            </div>
          </button>
          {activeSection === "about" && (
            <div className="border-t border-border p-4 space-y-3">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-orange">
                  <span className="text-lg font-bold text-primary-foreground">CP</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">CHOUF<span className="font-light text-primary">Play</span></h3>
                  <p className="text-[11px] text-muted-foreground">IPTV Player</p>
                </div>
              </div>

              <div className="space-y-2">
                {[
                  { icon: Code, label: "Version", value: "2.0.0" },
                  { icon: Info, label: "Développeur", value: "I-Success" },
                  { icon: Globe, label: "Site web", value: "choufplay.app" },
                  { icon: Mail, label: "Contact", value: "support@choufplay.app" },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-3 rounded-lg bg-secondary/50 px-3 py-2">
                    <item.icon size={14} className="text-muted-foreground shrink-0" />
                    <span className="text-xs text-muted-foreground">{item.label}</span>
                    <span className="ml-auto text-xs font-medium text-foreground">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
