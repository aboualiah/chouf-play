import { useState, useEffect } from "react";
import {
  ArrowLeft, Trophy, Monitor, Shield, Info, Globe, Mail, Code,
  PlayCircle, Tv, RefreshCw, Lock, LayoutDashboard, Languages,
  ChevronRight, Eye, EyeOff, Clock, Hash, Image, Columns,
  Wifi, Palette, Download, HardDrive, Zap, Volume2, Subtitles,
  ScreenShare, Ratio, ListOrdered, Smartphone
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const SETTINGS_KEY = "chouf_settings";
const PLAYER_SETTINGS_KEY = "chouf_player_settings";
const DISPLAY_SETTINGS_KEY = "chouf_display_settings";
const EPG_SETTINGS_KEY = "chouf_epg_settings";
const PARENTAL_SETTINGS_KEY = "chouf_parental_settings";
const DASHBOARD_SETTINGS_KEY = "chouf_dashboard_settings";
const REFRESH_SETTINGS_KEY = "chouf_refresh_settings";
const STREAM_SETTINGS_KEY = "chouf_stream_settings";
const INTERFACE_SETTINGS_KEY = "chouf_interface_settings";

// ── Match Settings ──
export interface MatchSettings {
  showBanner: boolean;
  competitions: Record<string, boolean>;
}

const DEFAULT_COMPETITIONS: Record<string, boolean> = {
  "Champions League": true, "Ligue 1": true, "Premier League": true,
  "La Liga": true, "Serie A": false, "Bundesliga": false, "Botola Pro": false,
  "NBA": true, "Roland Garros": false, "UFC": false, "Six Nations": false,
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

// ── Toggle Switch ──
function Toggle({ checked, onChange, color = "#FF6D00" }: { checked: boolean; onChange: (v: boolean) => void; color?: string }) {
  return (
    <button onClick={() => onChange(!checked)} className="relative h-7 w-12 rounded-full transition-colors shrink-0"
      style={{ background: checked ? color : "#1C1C24" }}>
      <span className="absolute top-0.5 h-6 w-6 rounded-full transition-transform shadow-md"
        style={{ background: checked ? "#fff" : "#48484A", transform: checked ? "translateX(22px)" : "translateX(2px)" }} />
    </button>
  );
}

// ── Setting Row ──
function SettingRow({ label, subtitle, children }: { label: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-3.5 px-1">
      <div className="flex-1 min-w-0 mr-3">
        <p className="text-[13px] font-medium" style={{ color: "#F5F5F7" }}>{label}</p>
        {subtitle && <p className="text-[11px] mt-0.5" style={{ color: "#48484A" }}>{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

// ── Select Dropdown ──
function SelectField({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      className="rounded-xl px-3 py-2 text-[12px] font-medium border-0 outline-none cursor-pointer"
      style={{ background: "#1C1C24", color: "#F5F5F7" }}>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

// ── Section Header ──
function SectionHeader({ icon: Icon, label, subtitle, color = "#FF6D00", active, onClick, badge }: {
  icon: React.ElementType; label: string; subtitle: string; color?: string; active: boolean; onClick: () => void; badge?: string;
}) {
  return (
    <button onClick={onClick} className="flex w-full items-center gap-3.5 p-4 text-left transition-colors"
      style={{ background: active ? "rgba(255,109,0,0.03)" : "transparent" }}>
      <div className="flex h-11 w-11 items-center justify-center rounded-xl shrink-0" style={{ background: `${color}15` }}>
        <Icon size={20} style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-[14px] font-semibold" style={{ color: "#F5F5F7" }}>{label}</p>
          {badge && <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: `${color}15`, color }}>{badge}</span>}
        </div>
        <p className="text-[11px]" style={{ color: "#48484A" }}>{subtitle}</p>
      </div>
      <ChevronRight size={16} className="shrink-0 transition-transform"
        style={{ color: "#48484A", transform: active ? "rotate(90deg)" : "rotate(0deg)" }} />
    </button>
  );
}

export default function Settings() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<string>("");

  // States
  const [matchSettings, setMatchSettings] = useState<MatchSettings>(getMatchSettings());
  const [hardwareDecoding, setHardwareDecoding] = useState(true);
  const [resumePlayback, setResumePlayback] = useState(true);
  const [preferredQuality, setPreferredQuality] = useState("auto");
  const [bufferSize, setBufferSize] = useState(30);
  const [audioTrack, setAudioTrack] = useState("auto");
  const [subtitlesEnabled, setSubtitlesEnabled] = useState(false);
  const [subtitleSize, setSubtitleSize] = useState("medium");
  const [aspectRatio, setAspectRatio] = useState("auto");

  const [showLogos, setShowLogos] = useState(true);
  const [showNumbers, setShowNumbers] = useState(false);
  const [compactMode, setCompactMode] = useState(false);
  const [showClock, setShowClock] = useState(true);
  const [channelPreview, setChannelPreview] = useState(true);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);

  const [epgEnabled, setEpgEnabled] = useState(false);
  const [epgUrl, setEpgUrl] = useState("");
  const [showEpgInList, setShowEpgInList] = useState(false);
  const [epgAutoRefresh, setEpgAutoRefresh] = useState(true);
  const [epgRefreshInterval, setEpgRefreshInterval] = useState("24");

  const [parentalEnabled, setParentalEnabled] = useState(false);
  const [parentalPin, setParentalPin] = useState("");
  const [hideAdultCats, setHideAdultCats] = useState(true);

  const [dashboardPin, setDashboardPin] = useState("1234");

  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(24);

  const [streamType, setStreamType] = useState("auto");
  const [connectionTimeout, setConnectionTimeout] = useState(15);
  const [retryOnError, setRetryOnError] = useState(true);
  const [userAgent, setUserAgent] = useState("default");

  const [startPage, setStartPage] = useState("home");
  const [language, setLanguage] = useState("fr");
  const [channelSortOrder, setChannelSortOrder] = useState("default");

  // Load
  useEffect(() => {
    try { const p = JSON.parse(localStorage.getItem(PLAYER_SETTINGS_KEY) || "{}");
      if (p.hardwareDecoding !== undefined) setHardwareDecoding(p.hardwareDecoding);
      if (p.resumePlayback !== undefined) setResumePlayback(p.resumePlayback);
      if (p.preferredQuality) setPreferredQuality(p.preferredQuality);
      if (p.bufferSize) setBufferSize(p.bufferSize);
      if (p.audioTrack) setAudioTrack(p.audioTrack);
      if (p.subtitlesEnabled !== undefined) setSubtitlesEnabled(p.subtitlesEnabled);
      if (p.subtitleSize) setSubtitleSize(p.subtitleSize);
      if (p.aspectRatio) setAspectRatio(p.aspectRatio);
    } catch {}
    try { const d = JSON.parse(localStorage.getItem(DISPLAY_SETTINGS_KEY) || "{}");
      if (d.showLogos !== undefined) setShowLogos(d.showLogos);
      if (d.showNumbers !== undefined) setShowNumbers(d.showNumbers);
      if (d.compactMode !== undefined) setCompactMode(d.compactMode);
      if (d.showClock !== undefined) setShowClock(d.showClock);
      if (d.channelPreview !== undefined) setChannelPreview(d.channelPreview);
      if (d.animationsEnabled !== undefined) setAnimationsEnabled(d.animationsEnabled);
    } catch {}
    try { const e = JSON.parse(localStorage.getItem(EPG_SETTINGS_KEY) || "{}");
      if (e.epgEnabled !== undefined) setEpgEnabled(e.epgEnabled);
      if (e.epgUrl) setEpgUrl(e.epgUrl);
      if (e.showEpgInList !== undefined) setShowEpgInList(e.showEpgInList);
      if (e.epgAutoRefresh !== undefined) setEpgAutoRefresh(e.epgAutoRefresh);
      if (e.epgRefreshInterval) setEpgRefreshInterval(e.epgRefreshInterval);
    } catch {}
    try { const pa = JSON.parse(localStorage.getItem(PARENTAL_SETTINGS_KEY) || "{}");
      if (pa.parentalEnabled !== undefined) setParentalEnabled(pa.parentalEnabled);
      if (pa.parentalPin) setParentalPin(pa.parentalPin);
      if (pa.hideAdultCats !== undefined) setHideAdultCats(pa.hideAdultCats);
    } catch {}
    try { const da = JSON.parse(localStorage.getItem(DASHBOARD_SETTINGS_KEY) || "{}");
      if (da.dashboardPin) setDashboardPin(da.dashboardPin);
    } catch {}
    try { const r = JSON.parse(localStorage.getItem(REFRESH_SETTINGS_KEY) || "{}");
      if (r.autoRefresh !== undefined) setAutoRefresh(r.autoRefresh);
      if (r.refreshInterval) setRefreshInterval(r.refreshInterval);
    } catch {}
    try { const s = JSON.parse(localStorage.getItem(STREAM_SETTINGS_KEY) || "{}");
      if (s.streamType) setStreamType(s.streamType);
      if (s.connectionTimeout) setConnectionTimeout(s.connectionTimeout);
      if (s.retryOnError !== undefined) setRetryOnError(s.retryOnError);
      if (s.userAgent) setUserAgent(s.userAgent);
    } catch {}
    try { const i = JSON.parse(localStorage.getItem(INTERFACE_SETTINGS_KEY) || "{}");
      if (i.startPage) setStartPage(i.startPage);
      if (i.language) setLanguage(i.language);
      if (i.channelSortOrder) setChannelSortOrder(i.channelSortOrder);
    } catch {}
  }, []);

  // Save
  useEffect(() => { saveSettings(SETTINGS_KEY, matchSettings); }, [matchSettings]);
  useEffect(() => { saveSettings(PLAYER_SETTINGS_KEY, { hardwareDecoding, resumePlayback, preferredQuality, bufferSize, audioTrack, subtitlesEnabled, subtitleSize, aspectRatio }); }, [hardwareDecoding, resumePlayback, preferredQuality, bufferSize, audioTrack, subtitlesEnabled, subtitleSize, aspectRatio]);
  useEffect(() => { saveSettings(DISPLAY_SETTINGS_KEY, { showLogos, showNumbers, compactMode, showClock, channelPreview, animationsEnabled }); }, [showLogos, showNumbers, compactMode, showClock, channelPreview, animationsEnabled]);
  useEffect(() => { saveSettings(EPG_SETTINGS_KEY, { epgEnabled, epgUrl, showEpgInList, epgAutoRefresh, epgRefreshInterval }); }, [epgEnabled, epgUrl, showEpgInList, epgAutoRefresh, epgRefreshInterval]);
  useEffect(() => { saveSettings(PARENTAL_SETTINGS_KEY, { parentalEnabled, parentalPin, hideAdultCats }); }, [parentalEnabled, parentalPin, hideAdultCats]);
  useEffect(() => { saveSettings(DASHBOARD_SETTINGS_KEY, { dashboardPin }); }, [dashboardPin]);
  useEffect(() => { saveSettings(REFRESH_SETTINGS_KEY, { autoRefresh, refreshInterval }); }, [autoRefresh, refreshInterval]);
  useEffect(() => { saveSettings(STREAM_SETTINGS_KEY, { streamType, connectionTimeout, retryOnError, userAgent }); }, [streamType, connectionTimeout, retryOnError, userAgent]);
  useEffect(() => { saveSettings(INTERFACE_SETTINGS_KEY, { startPage, language, channelSortOrder }); }, [startPage, language, channelSortOrder]);

  const toggleSection = (s: string) => setActiveSection(prev => prev === s ? "" : s);

  const toggleComp = (comp: string) => {
    setMatchSettings(prev => ({ ...prev, competitions: { ...prev.competitions, [comp]: !prev.competitions[comp] } }));
  };
  const setAllComps = (val: boolean) => {
    const comps: Record<string, boolean> = {};
    [...FOOTBALL_COMPS, ...OTHER_COMPS].forEach(c => (comps[c] = val));
    setMatchSettings(prev => ({ ...prev, competitions: comps }));
  };

  const CompChip = ({ name }: { name: string }) => (
    <button onClick={() => toggleComp(name)}
      className="rounded-xl px-3.5 py-2 text-[12px] font-medium transition-all border"
      style={matchSettings.competitions[name]
        ? { background: "rgba(255,109,0,0.12)", color: "#FF6D00", borderColor: "rgba(255,109,0,0.3)" }
        : { background: "#0A0A0F", color: "#48484A", borderColor: "#1C1C24" }}>
      {name}
    </button>
  );

  const Divider = () => <div className="h-px mx-1" style={{ background: "#1C1C2440" }} />;

  const sections = [
    {
      id: "player", icon: PlayCircle, label: "Lecteur vidéo", subtitle: "Décodage, qualité, sous-titres, tampon",
      color: "#FF6D00", badge: "PRO",
      content: (
        <div className="space-y-0">
          <SettingRow label="Décodage matériel" subtitle="Accélération GPU pour de meilleures performances">
            <Toggle checked={hardwareDecoding} onChange={setHardwareDecoding} />
          </SettingRow><Divider />
          <SettingRow label="Reprendre la lecture" subtitle="Reprendre là où vous étiez">
            <Toggle checked={resumePlayback} onChange={setResumePlayback} />
          </SettingRow><Divider />
          <SettingRow label="Qualité préférée" subtitle="Résolution par défaut du flux">
            <SelectField value={preferredQuality} onChange={setPreferredQuality}
              options={[{ value: "auto", label: "Auto" }, { value: "1080p", label: "1080p FHD" }, { value: "720p", label: "720p HD" }, { value: "480p", label: "480p SD" }, { value: "360p", label: "360p" }]} />
          </SettingRow><Divider />
          <SettingRow label="Ratio d'affichage" subtitle="Format de l'image vidéo">
            <SelectField value={aspectRatio} onChange={setAspectRatio}
              options={[{ value: "auto", label: "Auto" }, { value: "16:9", label: "16:9" }, { value: "4:3", label: "4:3" }, { value: "fill", label: "Remplir" }]} />
          </SettingRow><Divider />
          <SettingRow label={`Taille du tampon : ${bufferSize}s`} subtitle="Buffer de lecture (5s - 60s)">
            <input type="range" min={5} max={60} value={bufferSize} onChange={e => setBufferSize(+e.target.value)} className="w-28 accent-[#FF6D00]" />
          </SettingRow><Divider />
          <SettingRow label="Piste audio" subtitle="Langue audio préférée">
            <SelectField value={audioTrack} onChange={setAudioTrack}
              options={[{ value: "auto", label: "Auto" }, { value: "fr", label: "Français" }, { value: "en", label: "English" }, { value: "ar", label: "العربية" }]} />
          </SettingRow><Divider />
          <SettingRow label="Sous-titres" subtitle="Activer les sous-titres intégrés">
            <Toggle checked={subtitlesEnabled} onChange={setSubtitlesEnabled} />
          </SettingRow>
          {subtitlesEnabled && (
            <>
              <Divider />
              <SettingRow label="Taille des sous-titres" subtitle="Taille du texte des sous-titres">
                <SelectField value={subtitleSize} onChange={setSubtitleSize}
                  options={[{ value: "small", label: "Petit" }, { value: "medium", label: "Moyen" }, { value: "large", label: "Grand" }, { value: "xlarge", label: "Très grand" }]} />
              </SettingRow>
            </>
          )}
        </div>
      ),
    },
    {
      id: "stream", icon: Wifi, label: "Flux & Connexion", subtitle: "Type de flux, timeout, user-agent",
      color: "#5856D6",
      content: (
        <div className="space-y-0">
          <SettingRow label="Type de flux préféré" subtitle="Format du flux vidéo">
            <SelectField value={streamType} onChange={setStreamType}
              options={[{ value: "auto", label: "Auto" }, { value: "hls", label: "HLS (m3u8)" }, { value: "ts", label: "MPEG-TS" }, { value: "mpegts", label: "mpegts.js" }]} />
          </SettingRow><Divider />
          <SettingRow label={`Timeout : ${connectionTimeout}s`} subtitle="Délai de connexion max">
            <input type="range" min={5} max={60} value={connectionTimeout} onChange={e => setConnectionTimeout(+e.target.value)} className="w-28 accent-[#5856D6]" />
          </SettingRow><Divider />
          <SettingRow label="Réessayer en cas d'erreur" subtitle="Reconnecter automatiquement si le flux coupe">
            <Toggle checked={retryOnError} onChange={setRetryOnError} color="#5856D6" />
          </SettingRow><Divider />
          <SettingRow label="User-Agent" subtitle="Identifiant envoyé au serveur">
            <SelectField value={userAgent} onChange={setUserAgent}
              options={[{ value: "default", label: "Par défaut" }, { value: "vlc", label: "VLC" }, { value: "tivimate", label: "TiviMate" }, { value: "custom", label: "Personnalisé" }]} />
          </SettingRow>
        </div>
      ),
    },
    {
      id: "display", icon: Monitor, label: "Affichage", subtitle: "Interface, logos, animations",
      color: "#007AFF",
      content: (
        <div className="space-y-0">
          <SettingRow label="Afficher les logos" subtitle="Logos des chaînes dans la liste"><Toggle checked={showLogos} onChange={setShowLogos} color="#007AFF" /></SettingRow><Divider />
          <SettingRow label="Numéros de chaînes" subtitle="Numérotation dans la liste"><Toggle checked={showNumbers} onChange={setShowNumbers} color="#007AFF" /></SettingRow><Divider />
          <SettingRow label="Mode compact" subtitle="Réduire l'espacement"><Toggle checked={compactMode} onChange={setCompactMode} color="#007AFF" /></SettingRow><Divider />
          <SettingRow label="Horloge" subtitle="Afficher l'heure dans le header"><Toggle checked={showClock} onChange={setShowClock} color="#007AFF" /></SettingRow><Divider />
          <SettingRow label="Aperçu de chaîne" subtitle="Mini-aperçu au survol"><Toggle checked={channelPreview} onChange={setChannelPreview} color="#007AFF" /></SettingRow><Divider />
          <SettingRow label="Animations" subtitle="Transitions et animations de l'interface"><Toggle checked={animationsEnabled} onChange={setAnimationsEnabled} color="#007AFF" /></SettingRow>
        </div>
      ),
    },
    {
      id: "interface", icon: Smartphone, label: "Interface générale", subtitle: "Page de démarrage, langue, tri",
      color: "#FF9500",
      content: (
        <div className="space-y-0">
          <SettingRow label="Page de démarrage" subtitle="Page affichée au lancement">
            <SelectField value={startPage} onChange={setStartPage}
              options={[{ value: "home", label: "Accueil" }, { value: "live", label: "TV en direct" }, { value: "last", label: "Dernière chaîne" }]} />
          </SettingRow><Divider />
          <SettingRow label="Langue" subtitle="Langue de l'interface">
            <SelectField value={language} onChange={setLanguage}
              options={[{ value: "fr", label: "Français" }, { value: "en", label: "English" }, { value: "ar", label: "العربية" }]} />
          </SettingRow><Divider />
          <SettingRow label="Tri des chaînes" subtitle="Ordre d'affichage par défaut">
            <SelectField value={channelSortOrder} onChange={setChannelSortOrder}
              options={[{ value: "default", label: "Par défaut" }, { value: "name", label: "Alphabétique" }, { value: "category", label: "Par catégorie" }, { value: "recent", label: "Récentes" }]} />
          </SettingRow>
        </div>
      ),
    },
    {
      id: "epg", icon: Tv, label: "EPG", subtitle: "Guide électronique des programmes",
      color: "#34C759",
      content: (
        <div className="space-y-0">
          <SettingRow label="Activer l'EPG" subtitle="Guide des programmes"><Toggle checked={epgEnabled} onChange={setEpgEnabled} color="#34C759" /></SettingRow>
          {epgEnabled && (
            <>
              <Divider />
              <SettingRow label="Afficher dans la liste" subtitle="Voir le programme en cours"><Toggle checked={showEpgInList} onChange={setShowEpgInList} color="#34C759" /></SettingRow><Divider />
              <SettingRow label="Auto-refresh EPG" subtitle="Mettre à jour automatiquement"><Toggle checked={epgAutoRefresh} onChange={setEpgAutoRefresh} color="#34C759" /></SettingRow>
              {epgAutoRefresh && (
                <>
                  <Divider />
                  <SettingRow label="Intervalle de refresh" subtitle="Fréquence de mise à jour">
                    <SelectField value={epgRefreshInterval} onChange={setEpgRefreshInterval}
                      options={[{ value: "6", label: "6h" }, { value: "12", label: "12h" }, { value: "24", label: "24h" }, { value: "48", label: "48h" }]} />
                  </SettingRow>
                </>
              )}
              <Divider />
              <div className="pt-3 px-1">
                <label className="text-[11px] font-medium block mb-1.5" style={{ color: "#86868B" }}>URL du fichier EPG (XMLTV)</label>
                <input value={epgUrl} onChange={e => setEpgUrl(e.target.value)}
                  placeholder="https://example.com/epg.xml.gz"
                  className="w-full rounded-xl px-3 py-2.5 text-[12px] border outline-none focus:border-[#34C759] transition-colors"
                  style={{ background: "#0A0A0F", color: "#F5F5F7", borderColor: "#1C1C24" }} />
              </div>
            </>
          )}
        </div>
      ),
    },
    {
      id: "matchs", icon: Trophy, label: "Matchs & Sports", subtitle: "Bannière matchs et compétitions",
      color: "#C9A84C",
      content: (
        <div className="space-y-4">
          <SettingRow label="Bannière matchs" subtitle="Carousel de matchs en page d'accueil">
            <Toggle checked={matchSettings.showBanner} onChange={v => setMatchSettings(p => ({ ...p, showBanner: v }))} color="#C9A84C" />
          </SettingRow>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider mb-3 px-1" style={{ color: "#48484A" }}>Compétitions</p>
            <div className="flex gap-2 mb-4 px-1">
              <button onClick={() => setAllComps(true)} className="rounded-xl px-3 py-1.5 text-[11px] font-medium" style={{ background: "#1C1C24", color: "#F5F5F7" }}>✓ Tout</button>
              <button onClick={() => setAllComps(false)} className="rounded-xl px-3 py-1.5 text-[11px] font-medium" style={{ background: "#1C1C24", color: "#48484A" }}>✕ Rien</button>
            </div>
            <p className="text-[11px] font-medium mb-2 px-1" style={{ color: "#86868B" }}>⚽ Football</p>
            <div className="flex flex-wrap gap-2 mb-4 px-1">{FOOTBALL_COMPS.map(c => <CompChip key={c} name={c} />)}</div>
            <p className="text-[11px] font-medium mb-2 px-1" style={{ color: "#86868B" }}>🏅 Autres</p>
            <div className="flex flex-wrap gap-2 px-1">{OTHER_COMPS.map(c => <CompChip key={c} name={c} />)}</div>
          </div>
        </div>
      ),
    },
    {
      id: "parental", icon: Lock, label: "Contrôle parental", subtitle: "Restrictions, code PIN, catégories adultes",
      color: "#FF3B30",
      content: (
        <div className="space-y-0">
          <SettingRow label="Contrôle parental" subtitle="Bloquer les contenus sensibles"><Toggle checked={parentalEnabled} onChange={setParentalEnabled} color="#FF3B30" /></SettingRow>
          {parentalEnabled && (
            <>
              <Divider />
              <SettingRow label="Masquer catégories adultes" subtitle="Cacher automatiquement le contenu XXX"><Toggle checked={hideAdultCats} onChange={setHideAdultCats} color="#FF3B30" /></SettingRow>
              <Divider />
              <div className="pt-3 px-1">
                <label className="text-[11px] font-medium block mb-1.5" style={{ color: "#86868B" }}>Code PIN (4 chiffres)</label>
                <input value={parentalPin} onChange={e => { if (e.target.value.length <= 4 && /^\d*$/.test(e.target.value)) setParentalPin(e.target.value); }}
                  placeholder="0000" maxLength={4}
                  className="w-32 rounded-xl px-3 py-2.5 text-[14px] font-mono text-center border outline-none tracking-widest focus:border-[#FF3B30] transition-colors"
                  style={{ background: "#0A0A0F", color: "#F5F5F7", borderColor: "#1C1C24" }} />
              </div>
            </>
          )}
        </div>
      ),
    },
    {
      id: "dashboard", icon: LayoutDashboard, label: "Dashboard", subtitle: "Gestion à distance, code PIN",
      color: "#C9A84C",
      content: (
        <div className="pt-1 px-1">
          <label className="text-[11px] font-medium block mb-1.5" style={{ color: "#86868B" }}>Code PIN Dashboard (4 chiffres)</label>
          <input value={dashboardPin} onChange={e => { if (e.target.value.length <= 4 && /^\d*$/.test(e.target.value)) setDashboardPin(e.target.value); }}
            placeholder="1234" maxLength={4}
            className="w-32 rounded-xl px-3 py-2.5 text-[14px] font-mono text-center border outline-none tracking-widest focus:border-[#C9A84C] transition-colors"
            style={{ background: "#0A0A0F", color: "#F5F5F7", borderColor: "#1C1C24" }} />
        </div>
      ),
    },
    {
      id: "refresh", icon: RefreshCw, label: "Actualisation auto", subtitle: "Mise à jour automatique des playlists",
      color: "#007AFF",
      content: (
        <div className="space-y-0">
          <SettingRow label="Actualisation automatique" subtitle="Rafraîchir les playlists périodiquement"><Toggle checked={autoRefresh} onChange={setAutoRefresh} color="#007AFF" /></SettingRow>
          {autoRefresh && (
            <><Divider />
              <SettingRow label={`Intervalle : ${refreshInterval}h`} subtitle="Fréquence de mise à jour">
                <input type="range" min={1} max={72} value={refreshInterval} onChange={e => setRefreshInterval(+e.target.value)} className="w-28 accent-[#007AFF]" />
              </SettingRow>
            </>
          )}
        </div>
      ),
    },
    {
      id: "about", icon: Info, label: "À propos", subtitle: "Version, développeur, contact",
      color: "#86868B",
      content: (
        <div className="space-y-3">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-orange">
              <span className="text-lg font-bold text-white">CP</span>
            </div>
            <div>
              <h3 className="text-base font-bold" style={{ color: "#F5F5F7" }}>CHOUF<span className="font-light" style={{ color: "#FF6D00" }}>Play</span></h3>
              <p className="text-[11px]" style={{ color: "#48484A" }}>IPTV Player</p>
            </div>
          </div>
          <div className="space-y-1.5">
            {[
              { icon: Code, label: "Version", value: "2.1.0" },
              { icon: Info, label: "Développeur", value: "I-Success" },
              { icon: Globe, label: "Site web", value: "choufplay.app" },
              { icon: Mail, label: "Contact", value: "support@choufplay.app" },
              { icon: HardDrive, label: "Stockage", value: "localStorage" },
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
      <header className="sticky top-0 z-10 flex items-center gap-3 px-4 py-3 sm:px-6"
        style={{ background: "rgba(10,10,15,0.85)", backdropFilter: "blur(12px)", borderBottom: "1px solid #1C1C24" }}>
        <button onClick={() => navigate("/")} className="rounded-xl p-2 transition-colors" style={{ background: "#131318", color: "#86868B" }}>
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-lg font-bold" style={{ color: "#F5F5F7" }}>Paramètres</h1>
          <p className="text-[10px]" style={{ color: "#48484A" }}>Configuration avancée</p>
        </div>
      </header>

      <div className="mx-auto max-w-2xl p-4 sm:p-6 space-y-2">
        {/* Group: Lecture */}
        <p className="text-[10px] font-bold uppercase tracking-widest px-2 pt-2 pb-1" style={{ color: "#48484A" }}>Lecture</p>
        {sections.filter(s => ["player", "stream"].includes(s.id)).map(section => (
          <section key={section.id} className="rounded-2xl overflow-hidden" style={{ background: "#131318", border: "1px solid #1C1C24" }}>
            <SectionHeader icon={section.icon} label={section.label} subtitle={section.subtitle}
              color={section.color} active={activeSection === section.id} onClick={() => toggleSection(section.id)} badge={section.badge} />
            {activeSection === section.id && (
              <div className="px-4 pb-4" style={{ borderTop: "1px solid #1C1C24" }}><div className="pt-2">{section.content}</div></div>
            )}
          </section>
        ))}

        {/* Group: Interface */}
        <p className="text-[10px] font-bold uppercase tracking-widest px-2 pt-4 pb-1" style={{ color: "#48484A" }}>Interface</p>
        {sections.filter(s => ["display", "interface"].includes(s.id)).map(section => (
          <section key={section.id} className="rounded-2xl overflow-hidden" style={{ background: "#131318", border: "1px solid #1C1C24" }}>
            <SectionHeader icon={section.icon} label={section.label} subtitle={section.subtitle}
              color={section.color} active={activeSection === section.id} onClick={() => toggleSection(section.id)} />
            {activeSection === section.id && (
              <div className="px-4 pb-4" style={{ borderTop: "1px solid #1C1C24" }}><div className="pt-2">{section.content}</div></div>
            )}
          </section>
        ))}

        {/* Group: Contenu */}
        <p className="text-[10px] font-bold uppercase tracking-widest px-2 pt-4 pb-1" style={{ color: "#48484A" }}>Contenu</p>
        {sections.filter(s => ["epg", "matchs"].includes(s.id)).map(section => (
          <section key={section.id} className="rounded-2xl overflow-hidden" style={{ background: "#131318", border: "1px solid #1C1C24" }}>
            <SectionHeader icon={section.icon} label={section.label} subtitle={section.subtitle}
              color={section.color} active={activeSection === section.id} onClick={() => toggleSection(section.id)} />
            {activeSection === section.id && (
              <div className="px-4 pb-4" style={{ borderTop: "1px solid #1C1C24" }}><div className="pt-2">{section.content}</div></div>
            )}
          </section>
        ))}

        {/* Group: Sécurité & Maintenance */}
        <p className="text-[10px] font-bold uppercase tracking-widest px-2 pt-4 pb-1" style={{ color: "#48484A" }}>Sécurité & Maintenance</p>
        {sections.filter(s => ["parental", "dashboard", "refresh"].includes(s.id)).map(section => (
          <section key={section.id} className="rounded-2xl overflow-hidden" style={{ background: "#131318", border: "1px solid #1C1C24" }}>
            <SectionHeader icon={section.icon} label={section.label} subtitle={section.subtitle}
              color={section.color} active={activeSection === section.id} onClick={() => toggleSection(section.id)} />
            {activeSection === section.id && (
              <div className="px-4 pb-4" style={{ borderTop: "1px solid #1C1C24" }}><div className="pt-2">{section.content}</div></div>
            )}
          </section>
        ))}

        {/* About */}
        <p className="text-[10px] font-bold uppercase tracking-widest px-2 pt-4 pb-1" style={{ color: "#48484A" }}>Informations</p>
        {sections.filter(s => s.id === "about").map(section => (
          <section key={section.id} className="rounded-2xl overflow-hidden" style={{ background: "#131318", border: "1px solid #1C1C24" }}>
            <SectionHeader icon={section.icon} label={section.label} subtitle={section.subtitle}
              color={section.color} active={activeSection === section.id} onClick={() => toggleSection(section.id)} />
            {activeSection === section.id && (
              <div className="px-4 pb-4" style={{ borderTop: "1px solid #1C1C24" }}><div className="pt-2">{section.content}</div></div>
            )}
          </section>
        ))}

        <div className="h-8" />
      </div>
    </div>
  );
}
