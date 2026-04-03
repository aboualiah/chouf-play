import { useState, useEffect } from "react";
import {
  ArrowLeft, Trophy, Monitor, Shield, Info, Globe, Mail, Code,
  PlayCircle, Tv, RefreshCw, Lock, LayoutDashboard, Languages,
  ChevronRight, Eye, EyeOff, Clock, Hash, Image, Columns
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const SETTINGS_KEY = "chouf_settings";
const PLAYER_SETTINGS_KEY = "chouf_player_settings";
const DISPLAY_SETTINGS_KEY = "chouf_display_settings";
const EPG_SETTINGS_KEY = "chouf_epg_settings";
const PARENTAL_SETTINGS_KEY = "chouf_parental_settings";
const DASHBOARD_SETTINGS_KEY = "chouf_dashboard_settings";
const REFRESH_SETTINGS_KEY = "chouf_refresh_settings";

// ── Match Settings ──
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

function saveSettings(key: string, val: unknown) {
  localStorage.setItem(key, JSON.stringify(val));
}

const FOOTBALL_COMPS = ["Champions League", "Ligue 1", "Premier League", "La Liga", "Serie A", "Bundesliga", "Botola Pro"];
const OTHER_COMPS = ["NBA", "Roland Garros", "UFC", "Six Nations"];

// ── Toggle Switch Component ──
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="relative h-6 w-11 rounded-full transition-colors shrink-0"
      style={{ background: checked ? "#FF6D00" : "#1C1C24" }}
    >
      <span
        className="absolute top-0.5 h-5 w-5 rounded-full transition-transform"
        style={{
          background: checked ? "#fff" : "#48484A",
          transform: checked ? "translateX(22px)" : "translateX(2px)",
        }}
      />
    </button>
  );
}

// ── Setting Row ──
function SettingRow({ label, subtitle, children }: { label: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex-1 min-w-0 mr-3">
        <p className="text-[13px] font-medium" style={{ color: "#F5F5F7" }}>{label}</p>
        {subtitle && <p className="text-[11px] mt-0.5" style={{ color: "#48484A" }}>{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

// ── Section Header ──
function SectionHeader({ icon: Icon, label, subtitle, color = "#FF6D00", active, onClick }: {
  icon: React.ElementType; label: string; subtitle: string; color?: string; active: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 p-4 text-left transition-colors"
      style={{ background: active ? "rgba(255,109,0,0.03)" : "transparent" }}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl shrink-0" style={{ background: `${color}15` }}>
        <Icon size={20} style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-semibold" style={{ color: "#F5F5F7" }}>{label}</p>
        <p className="text-[11px]" style={{ color: "#48484A" }}>{subtitle}</p>
      </div>
      <ChevronRight
        size={16}
        className="shrink-0 transition-transform"
        style={{ color: "#48484A", transform: active ? "rotate(90deg)" : "rotate(0deg)" }}
      />
    </button>
  );
}

export default function Settings() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<string>("");

  // ── Match state ──
  const [matchSettings, setMatchSettings] = useState<MatchSettings>(getMatchSettings());

  // ── Player state ──
  const [hardwareDecoding, setHardwareDecoding] = useState(true);
  const [resumePlayback, setResumePlayback] = useState(true);
  const [preferredQuality, setPreferredQuality] = useState("auto");
  const [bufferSize, setBufferSize] = useState(30);

  // ── Display state ──
  const [showLogos, setShowLogos] = useState(true);
  const [showNumbers, setShowNumbers] = useState(false);
  const [compactMode, setCompactMode] = useState(false);
  const [showClock, setShowClock] = useState(true);

  // ── EPG state ──
  const [epgEnabled, setEpgEnabled] = useState(false);
  const [epgUrl, setEpgUrl] = useState("");
  const [showEpgInList, setShowEpgInList] = useState(false);

  // ── Parental state ──
  const [parentalEnabled, setParentalEnabled] = useState(false);
  const [parentalPin, setParentalPin] = useState("");

  // ── Dashboard state ──
  const [dashboardPin, setDashboardPin] = useState("1234");

  // ── Auto-refresh state ──
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(24);

  // Load all settings
  useEffect(() => {
    try {
      const p = JSON.parse(localStorage.getItem(PLAYER_SETTINGS_KEY) || "{}");
      if (p.hardwareDecoding !== undefined) setHardwareDecoding(p.hardwareDecoding);
      if (p.resumePlayback !== undefined) setResumePlayback(p.resumePlayback);
      if (p.preferredQuality) setPreferredQuality(p.preferredQuality);
      if (p.bufferSize) setBufferSize(p.bufferSize);
    } catch {}
    try {
      const d = JSON.parse(localStorage.getItem(DISPLAY_SETTINGS_KEY) || "{}");
      if (d.showLogos !== undefined) setShowLogos(d.showLogos);
      if (d.showNumbers !== undefined) setShowNumbers(d.showNumbers);
      if (d.compactMode !== undefined) setCompactMode(d.compactMode);
      if (d.showClock !== undefined) setShowClock(d.showClock);
    } catch {}
    try {
      const e = JSON.parse(localStorage.getItem(EPG_SETTINGS_KEY) || "{}");
      if (e.epgEnabled !== undefined) setEpgEnabled(e.epgEnabled);
      if (e.epgUrl) setEpgUrl(e.epgUrl);
      if (e.showEpgInList !== undefined) setShowEpgInList(e.showEpgInList);
    } catch {}
    try {
      const pa = JSON.parse(localStorage.getItem(PARENTAL_SETTINGS_KEY) || "{}");
      if (pa.parentalEnabled !== undefined) setParentalEnabled(pa.parentalEnabled);
      if (pa.parentalPin) setParentalPin(pa.parentalPin);
    } catch {}
    try {
      const da = JSON.parse(localStorage.getItem(DASHBOARD_SETTINGS_KEY) || "{}");
      if (da.dashboardPin) setDashboardPin(da.dashboardPin);
    } catch {}
    try {
      const r = JSON.parse(localStorage.getItem(REFRESH_SETTINGS_KEY) || "{}");
      if (r.autoRefresh !== undefined) setAutoRefresh(r.autoRefresh);
      if (r.refreshInterval) setRefreshInterval(r.refreshInterval);
    } catch {}
  }, []);

  // Save on change
  useEffect(() => { saveSettings(SETTINGS_KEY, matchSettings); }, [matchSettings]);
  useEffect(() => { saveSettings(PLAYER_SETTINGS_KEY, { hardwareDecoding, resumePlayback, preferredQuality, bufferSize }); }, [hardwareDecoding, resumePlayback, preferredQuality, bufferSize]);
  useEffect(() => { saveSettings(DISPLAY_SETTINGS_KEY, { showLogos, showNumbers, compactMode, showClock }); }, [showLogos, showNumbers, compactMode, showClock]);
  useEffect(() => { saveSettings(EPG_SETTINGS_KEY, { epgEnabled, epgUrl, showEpgInList }); }, [epgEnabled, epgUrl, showEpgInList]);
  useEffect(() => { saveSettings(PARENTAL_SETTINGS_KEY, { parentalEnabled, parentalPin }); }, [parentalEnabled, parentalPin]);
  useEffect(() => { saveSettings(DASHBOARD_SETTINGS_KEY, { dashboardPin }); }, [dashboardPin]);
  useEffect(() => { saveSettings(REFRESH_SETTINGS_KEY, { autoRefresh, refreshInterval }); }, [autoRefresh, refreshInterval]);

  const toggleSection = (s: string) => setActiveSection(prev => prev === s ? "" : s);

  const toggleComp = (comp: string) => {
    setMatchSettings(prev => ({
      ...prev,
      competitions: { ...prev.competitions, [comp]: !prev.competitions[comp] },
    }));
  };

  const setAllComps = (val: boolean) => {
    const comps: Record<string, boolean> = {};
    [...FOOTBALL_COMPS, ...OTHER_COMPS].forEach(c => (comps[c] = val));
    setMatchSettings(prev => ({ ...prev, competitions: comps }));
  };

  const CompChip = ({ name }: { name: string }) => (
    <button
      onClick={() => toggleComp(name)}
      className="rounded-xl px-3.5 py-2 text-[12px] font-medium transition-all border"
      style={
        matchSettings.competitions[name]
          ? { background: "rgba(255,109,0,0.12)", color: "#FF6D00", borderColor: "rgba(255,109,0,0.3)" }
          : { background: "#131318", color: "#48484A", borderColor: "#1C1C24" }
      }
    >
      {name}
    </button>
  );

  const sections = [
    {
      id: "player", icon: PlayCircle, label: "Lecteur", subtitle: "Décodage, qualité, tampon",
      color: "#FF6D00",
      content: (
        <div className="space-y-1 divide-y" style={{ borderColor: "#1C1C2440" }}>
          <SettingRow label="Décodage matériel" subtitle="Utiliser l'accélération GPU">
            <Toggle checked={hardwareDecoding} onChange={setHardwareDecoding} />
          </SettingRow>
          <SettingRow label="Reprendre la lecture" subtitle="Reprendre là où vous vous êtes arrêté">
            <Toggle checked={resumePlayback} onChange={setResumePlayback} />
          </SettingRow>
          <SettingRow label="Qualité préférée" subtitle="Auto, 1080p, 720p, 480p">
            <select
              value={preferredQuality}
              onChange={e => setPreferredQuality(e.target.value)}
              className="rounded-lg px-3 py-1.5 text-[12px] font-medium border-0 outline-none"
              style={{ background: "#1C1C24", color: "#F5F5F7" }}
            >
              <option value="auto">Auto</option>
              <option value="1080p">1080p</option>
              <option value="720p">720p</option>
              <option value="480p">480p</option>
            </select>
          </SettingRow>
          <SettingRow label={`Taille du tampon : ${bufferSize}s`} subtitle="Ajuster le buffer de lecture">
            <input
              type="range" min={5} max={60} value={bufferSize}
              onChange={e => setBufferSize(+e.target.value)}
              className="w-28 accent-[#FF6D00]"
            />
          </SettingRow>
        </div>
      ),
    },
    {
      id: "display", icon: Monitor, label: "Affichage", subtitle: "Interface et apparence",
      color: "#007AFF",
      content: (
        <div className="space-y-1 divide-y" style={{ borderColor: "#1C1C2440" }}>
          <SettingRow label="Afficher les logos" subtitle="Logos des chaînes dans la liste">
            <Toggle checked={showLogos} onChange={setShowLogos} />
          </SettingRow>
          <SettingRow label="Numéros de chaînes" subtitle="Afficher les numéros">
            <Toggle checked={showNumbers} onChange={setShowNumbers} />
          </SettingRow>
          <SettingRow label="Mode compact" subtitle="Réduire l'espacement des éléments">
            <Toggle checked={compactMode} onChange={setCompactMode} />
          </SettingRow>
          <SettingRow label="Afficher l'horloge" subtitle="Horloge dans le header">
            <Toggle checked={showClock} onChange={setShowClock} />
          </SettingRow>
          <div className="pt-3">
            <p className="text-[11px] font-medium" style={{ color: "#48484A" }}>Thème sombre activé par défaut</p>
          </div>
        </div>
      ),
    },
    {
      id: "epg", icon: Tv, label: "EPG", subtitle: "Guide électronique des programmes",
      color: "#34C759",
      content: (
        <div className="space-y-1 divide-y" style={{ borderColor: "#1C1C2440" }}>
          <SettingRow label="Activer l'EPG" subtitle="Guide des programmes en direct">
            <Toggle checked={epgEnabled} onChange={setEpgEnabled} />
          </SettingRow>
          {epgEnabled && (
            <>
              <SettingRow label="Afficher dans la liste" subtitle="EPG visible dans la liste des chaînes">
                <Toggle checked={showEpgInList} onChange={setShowEpgInList} />
              </SettingRow>
              <div className="pt-3">
                <label className="text-[11px] font-medium block mb-1.5" style={{ color: "#86868B" }}>URL du fichier EPG</label>
                <input
                  value={epgUrl}
                  onChange={e => setEpgUrl(e.target.value)}
                  placeholder="https://example.com/epg.xml"
                  className="w-full rounded-xl px-3 py-2.5 text-[12px] border outline-none focus:border-[#34C759] transition-colors"
                  style={{ background: "#1C1C24", color: "#F5F5F7", borderColor: "#242430" }}
                />
              </div>
            </>
          )}
        </div>
      ),
    },
    {
      id: "matchs", icon: Trophy, label: "Matchs & Sports", subtitle: "Bannière et compétitions",
      color: "#C9A84C",
      content: (
        <div className="space-y-4">
          <SettingRow label="Afficher la bannière matchs" subtitle="Carousel de matchs en haut de la page Live">
            <Toggle checked={matchSettings.showBanner} onChange={v => setMatchSettings(p => ({ ...p, showBanner: v }))} />
          </SettingRow>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider mb-3" style={{ color: "#48484A" }}>
              Compétitions à afficher
            </p>
            <div className="flex gap-2 mb-4">
              <button onClick={() => setAllComps(true)} className="rounded-xl px-3 py-1.5 text-[11px] font-medium transition-colors" style={{ background: "#1C1C24", color: "#F5F5F7" }}>
                ✓ Tout sélectionner
              </button>
              <button onClick={() => setAllComps(false)} className="rounded-xl px-3 py-1.5 text-[11px] font-medium transition-colors" style={{ background: "#1C1C24", color: "#48484A" }}>
                ✕ Tout désélectionner
              </button>
            </div>

            <p className="text-[11px] font-medium mb-2" style={{ color: "#86868B" }}>⚽ Football</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {FOOTBALL_COMPS.map(c => <CompChip key={c} name={c} />)}
            </div>

            <p className="text-[11px] font-medium mb-2" style={{ color: "#86868B" }}>🏅 Autres sports</p>
            <div className="flex flex-wrap gap-2">
              {OTHER_COMPS.map(c => <CompChip key={c} name={c} />)}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "parental", icon: Lock, label: "Contrôle parental", subtitle: "Restrictions et code PIN",
      color: "#FF3B30",
      content: (
        <div className="space-y-1 divide-y" style={{ borderColor: "#1C1C2440" }}>
          <SettingRow label="Activer le contrôle parental" subtitle="Bloquer certaines chaînes">
            <Toggle checked={parentalEnabled} onChange={setParentalEnabled} />
          </SettingRow>
          {parentalEnabled && (
            <div className="pt-3">
              <label className="text-[11px] font-medium block mb-1.5" style={{ color: "#86868B" }}>Code PIN (4 chiffres)</label>
              <input
                value={parentalPin}
                onChange={e => { if (e.target.value.length <= 4 && /^\d*$/.test(e.target.value)) setParentalPin(e.target.value); }}
                placeholder="0000"
                maxLength={4}
                className="w-32 rounded-xl px-3 py-2.5 text-[14px] font-mono text-center border outline-none tracking-widest focus:border-[#FF3B30] transition-colors"
                style={{ background: "#1C1C24", color: "#F5F5F7", borderColor: "#242430" }}
              />
            </div>
          )}
        </div>
      ),
    },
    {
      id: "dashboard", icon: LayoutDashboard, label: "Dashboard", subtitle: "Gestion à distance",
      color: "#C9A84C",
      content: (
        <div className="pt-1">
          <label className="text-[11px] font-medium block mb-1.5" style={{ color: "#86868B" }}>Code PIN Dashboard (4 chiffres)</label>
          <input
            value={dashboardPin}
            onChange={e => { if (e.target.value.length <= 4 && /^\d*$/.test(e.target.value)) setDashboardPin(e.target.value); }}
            placeholder="1234"
            maxLength={4}
            className="w-32 rounded-xl px-3 py-2.5 text-[14px] font-mono text-center border outline-none tracking-widest focus:border-[#C9A84C] transition-colors"
            style={{ background: "#1C1C24", color: "#F5F5F7", borderColor: "#242430" }}
          />
        </div>
      ),
    },
    {
      id: "refresh", icon: RefreshCw, label: "Actualisation auto", subtitle: "Mettre à jour les playlists",
      color: "#007AFF",
      content: (
        <div className="space-y-1 divide-y" style={{ borderColor: "#1C1C2440" }}>
          <SettingRow label="Actualisation automatique" subtitle="Rafraîchir les playlists périodiquement">
            <Toggle checked={autoRefresh} onChange={setAutoRefresh} />
          </SettingRow>
          {autoRefresh && (
            <SettingRow label={`Intervalle : ${refreshInterval}h`} subtitle="Fréquence de mise à jour">
              <input
                type="range" min={1} max={72} value={refreshInterval}
                onChange={e => setRefreshInterval(+e.target.value)}
                className="w-28 accent-[#007AFF]"
              />
            </SettingRow>
          )}
        </div>
      ),
    },
    {
      id: "about", icon: Info, label: "À propos", subtitle: "Informations sur l'application",
      color: "#86868B",
      content: (
        <div className="space-y-3">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-orange">
              <span className="text-lg font-bold text-white">CP</span>
            </div>
            <div>
              <h3 className="text-base font-bold" style={{ color: "#F5F5F7" }}>
                CHOUF<span className="font-light" style={{ color: "#FF6D00" }}>Play</span>
              </h3>
              <p className="text-[11px]" style={{ color: "#48484A" }}>IPTV Player</p>
            </div>
          </div>
          <div className="space-y-1.5">
            {[
              { icon: Code, label: "Version", value: "2.0.0" },
              { icon: Info, label: "Développeur", value: "I-Success" },
              { icon: Globe, label: "Site web", value: "choufplay.app" },
              { icon: Mail, label: "Contact", value: "support@choufplay.app" },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-3 rounded-xl px-3 py-2.5" style={{ background: "#0A0A0F" }}>
                <item.icon size={14} style={{ color: "#48484A" }} className="shrink-0" />
                <span className="text-[12px]" style={{ color: "#86868B" }}>{item.label}</span>
                <span className="ml-auto text-[12px] font-medium" style={{ color: "#F5F5F7" }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen" style={{ background: "#0A0A0F" }}>
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center gap-3 px-4 py-3 sm:px-6" style={{ background: "rgba(10,10,15,0.85)", backdropFilter: "blur(12px)", borderBottom: "1px solid #1C1C24" }}>
        <button onClick={() => navigate("/")} className="rounded-xl p-2 transition-colors" style={{ background: "#131318", color: "#86868B" }}>
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-lg font-bold" style={{ color: "#F5F5F7" }}>Paramètres</h1>
      </header>

      <div className="mx-auto max-w-2xl p-4 sm:p-6 space-y-3">
        {sections.map(section => (
          <section key={section.id} className="rounded-2xl overflow-hidden" style={{ background: "#131318", border: "1px solid #1C1C24" }}>
            <SectionHeader
              icon={section.icon}
              label={section.label}
              subtitle={section.subtitle}
              color={section.color}
              active={activeSection === section.id}
              onClick={() => toggleSection(section.id)}
            />
            {activeSection === section.id && (
              <div className="px-4 pb-4" style={{ borderTop: "1px solid #1C1C24" }}>
                <div className="pt-3">
                  {section.content}
                </div>
              </div>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
