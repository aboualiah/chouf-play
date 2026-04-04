import { useState, useEffect, useRef } from "react";
import {
  ArrowLeft, Trophy, Monitor, Shield, Info, Globe, Mail, Code,
  PlayCircle, Tv, RefreshCw, Lock, LayoutDashboard, Languages,
  ChevronRight, Eye, EyeOff, Clock, Hash, Image, Columns,
  Wifi, Palette, Download, HardDrive, Zap, Volume2, Subtitles,
  ScreenShare, Ratio, ListOrdered, Smartphone, Upload, Trash2,
  Plus, X, Save, RotateCcw, FileDown, FileUp, Radio
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useI18n, LANGUAGES, Lang } from "@/lib/i18n";
import { getParentalSettings, saveParentalSettings, ParentalSettings } from "@/lib/parental";
import { toast } from "sonner";

const PLAYER_SETTINGS_KEY = "chouf_player_settings";
const DISPLAY_SETTINGS_KEY = "chouf_display_settings";
const EPG_SETTINGS_KEY = "chouf_epg_settings";
const CATCHUP_SETTINGS_KEY = "chouf_catchup_settings";
const SETTINGS_KEY = "chouf_settings";
const DASHBOARD_SETTINGS_KEY = "chouf_dashboard_settings";
const REFRESH_SETTINGS_KEY = "chouf_refresh_settings";
const STREAM_SETTINGS_KEY = "chouf_stream_settings";
const INTERFACE_SETTINGS_KEY = "chouf_interface_settings";
const RECORDING_SETTINGS_KEY = "chouf_recording_settings";

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

// ── PIN Input (4 boxes) ──
function PinInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const refs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];
  const digits = value.padEnd(4, "").split("").slice(0, 4);

  const handleChange = (idx: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    const arr = [...digits];
    arr[idx] = val;
    onChange(arr.join("").replace(/ /g, ""));
    if (val && idx < 3) refs[idx + 1].current?.focus();
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[idx] && idx > 0) {
      refs[idx - 1].current?.focus();
    }
  };

  return (
    <div className="flex gap-2">
      {[0, 1, 2, 3].map(i => (
        <input
          key={i} ref={refs[i]} type="text" inputMode="numeric" maxLength={1}
          value={digits[i]?.trim() || ""}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKeyDown(i, e)}
          className="h-12 w-12 rounded-xl text-center text-lg font-bold border outline-none transition-colors focus:border-[#FF3B30]"
          style={{ background: "#0A0A0F", color: "#F5F5F7", borderColor: "#1C1C24" }}
        />
      ))}
    </div>
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
  const { t, lang, setLang } = useI18n();
  const [activeSection, setActiveSection] = useState<string>("");

  // States
  const [matchSettings, setMatchSettings] = useState<MatchSettings>(getMatchSettings());
  const [hardwareDecoding, setHardwareDecoding] = useState(true);
  const [resumePlayback, setResumePlayback] = useState(true);
  const [preferredQuality, setPreferredQuality] = useState("auto");
  const [bufferSize, setBufferSize] = useState("medium");
  const [streamFormat, setStreamFormat] = useState("auto");
  const [decoder, setDecoder] = useState("hardware");
  const [aspectRatio, setAspectRatio] = useState("auto");

  const [showLogos, setShowLogos] = useState(true);
  const [showNumbers, setShowNumbers] = useState(false);
  const [compactMode, setCompactMode] = useState(false);
  const [showClock, setShowClock] = useState(true);
  const [channelStyle, setChannelStyle] = useState("normal");
  const [textSize, setTextSize] = useState("normal");

  const [epgEnabled, setEpgEnabled] = useState(false);
  const [epgSource, setEpgSource] = useState("auto");
  const [epgUrl, setEpgUrl] = useState("");
  const [epgOffset, setEpgOffset] = useState("0");
  const [showEpgInList, setShowEpgInList] = useState(false);

  const [catchupEnabled, setCatchupEnabled] = useState(false);
  const [catchupDuration, setCatchupDuration] = useState("48");

  const [parental, setParental] = useState<ParentalSettings>(getParentalSettings());
  const [customCatInput, setCustomCatInput] = useState("");

  const [recQuality, setRecQuality] = useState("original");

  const [weatherCity, setWeatherCity] = useState("Brussels");
  const [startPage, setStartPage] = useState("home");
  const [autoUpdate, setAutoUpdate] = useState("never");

  const [streamType, setStreamType] = useState("auto");
  const [connectionTimeout, setConnectionTimeout] = useState(15);
  const [retryOnError, setRetryOnError] = useState(true);
  const [userAgent, setUserAgent] = useState("default");

  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(24);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load settings
  useEffect(() => {
    try { const p = JSON.parse(localStorage.getItem(PLAYER_SETTINGS_KEY) || "{}");
      if (p.hardwareDecoding !== undefined) setHardwareDecoding(p.hardwareDecoding);
      if (p.resumePlayback !== undefined) setResumePlayback(p.resumePlayback);
      if (p.preferredQuality) setPreferredQuality(p.preferredQuality);
      if (p.bufferSize) setBufferSize(p.bufferSize);
      if (p.streamFormat) setStreamFormat(p.streamFormat);
      if (p.decoder) setDecoder(p.decoder);
      if (p.aspectRatio) setAspectRatio(p.aspectRatio);
    } catch {}
    try { const d = JSON.parse(localStorage.getItem(DISPLAY_SETTINGS_KEY) || "{}");
      if (d.showLogos !== undefined) setShowLogos(d.showLogos);
      if (d.showNumbers !== undefined) setShowNumbers(d.showNumbers);
      if (d.compactMode !== undefined) setCompactMode(d.compactMode);
      if (d.showClock !== undefined) setShowClock(d.showClock);
      if (d.channelStyle) setChannelStyle(d.channelStyle);
      if (d.textSize) setTextSize(d.textSize);
    } catch {}
    try { const e = JSON.parse(localStorage.getItem(EPG_SETTINGS_KEY) || "{}");
      if (e.epgEnabled !== undefined) setEpgEnabled(e.epgEnabled);
      if (e.epgSource) setEpgSource(e.epgSource);
      if (e.epgUrl) setEpgUrl(e.epgUrl);
      if (e.epgOffset) setEpgOffset(e.epgOffset);
      if (e.showEpgInList !== undefined) setShowEpgInList(e.showEpgInList);
    } catch {}
    try { const c = JSON.parse(localStorage.getItem(CATCHUP_SETTINGS_KEY) || "{}");
      if (c.catchupEnabled !== undefined) setCatchupEnabled(c.catchupEnabled);
      if (c.catchupDuration) setCatchupDuration(c.catchupDuration);
    } catch {}
    try { const s = JSON.parse(localStorage.getItem(STREAM_SETTINGS_KEY) || "{}");
      if (s.streamType) setStreamType(s.streamType);
      if (s.connectionTimeout) setConnectionTimeout(s.connectionTimeout);
      if (s.retryOnError !== undefined) setRetryOnError(s.retryOnError);
      if (s.userAgent) setUserAgent(s.userAgent);
    } catch {}
    try { const i = JSON.parse(localStorage.getItem(INTERFACE_SETTINGS_KEY) || "{}");
      if (i.startPage) setStartPage(i.startPage);
      if (i.weatherCity) setWeatherCity(i.weatherCity);
      if (i.autoUpdate) setAutoUpdate(i.autoUpdate);
    } catch {}
    try { const r = JSON.parse(localStorage.getItem(REFRESH_SETTINGS_KEY) || "{}");
      if (r.autoRefresh !== undefined) setAutoRefresh(r.autoRefresh);
      if (r.refreshInterval) setRefreshInterval(r.refreshInterval);
    } catch {}
    try { const rec = JSON.parse(localStorage.getItem(RECORDING_SETTINGS_KEY) || "{}");
      if (rec.recQuality) setRecQuality(rec.recQuality);
    } catch {}
  }, []);

  // Save effects
  useEffect(() => { saveSettings(SETTINGS_KEY, matchSettings); }, [matchSettings]);
  useEffect(() => { saveSettings(PLAYER_SETTINGS_KEY, { hardwareDecoding, resumePlayback, preferredQuality, bufferSize, streamFormat, decoder, aspectRatio }); }, [hardwareDecoding, resumePlayback, preferredQuality, bufferSize, streamFormat, decoder, aspectRatio]);
  useEffect(() => { saveSettings(DISPLAY_SETTINGS_KEY, { showLogos, showNumbers, compactMode, showClock, channelStyle, textSize }); }, [showLogos, showNumbers, compactMode, showClock, channelStyle, textSize]);
  useEffect(() => { saveSettings(EPG_SETTINGS_KEY, { epgEnabled, epgSource, epgUrl, epgOffset, showEpgInList }); }, [epgEnabled, epgSource, epgUrl, epgOffset, showEpgInList]);
  useEffect(() => { saveSettings(CATCHUP_SETTINGS_KEY, { catchupEnabled, catchupDuration }); }, [catchupEnabled, catchupDuration]);
  useEffect(() => { saveParentalSettings(parental); }, [parental]);
  useEffect(() => { saveSettings(STREAM_SETTINGS_KEY, { streamType, connectionTimeout, retryOnError, userAgent }); }, [streamType, connectionTimeout, retryOnError, userAgent]);
  useEffect(() => { saveSettings(INTERFACE_SETTINGS_KEY, { startPage, weatherCity, autoUpdate }); }, [startPage, weatherCity, autoUpdate]);
  useEffect(() => { saveSettings(REFRESH_SETTINGS_KEY, { autoRefresh, refreshInterval }); }, [autoRefresh, refreshInterval]);
  useEffect(() => { saveSettings(RECORDING_SETTINGS_KEY, { recQuality }); }, [recQuality]);

  const toggleSection = (s: string) => setActiveSection(prev => prev === s ? "" : s);

  const toggleComp = (comp: string) => {
    setMatchSettings(prev => ({ ...prev, competitions: { ...prev.competitions, [comp]: !prev.competitions[comp] } }));
  };
  const setAllComps = (val: boolean) => {
    const comps: Record<string, boolean> = {};
    [...FOOTBALL_COMPS, ...OTHER_COMPS].forEach(c => (comps[c] = val));
    setMatchSettings(prev => ({ ...prev, competitions: comps }));
  };

  const addCustomCategory = () => {
    const cat = customCatInput.trim();
    if (!cat || parental.customCategories.includes(cat)) return;
    setParental(p => ({ ...p, customCategories: [...p.customCategories, cat] }));
    setCustomCatInput("");
  };

  const removeCustomCategory = (cat: string) => {
    setParental(p => ({ ...p, customCategories: p.customCategories.filter(c => c !== cat) }));
  };

  const handleExport = () => {
    const data: Record<string, unknown> = {};
    const keys = [PLAYER_SETTINGS_KEY, DISPLAY_SETTINGS_KEY, EPG_SETTINGS_KEY, CATCHUP_SETTINGS_KEY, SETTINGS_KEY, STREAM_SETTINGS_KEY, INTERFACE_SETTINGS_KEY, REFRESH_SETTINGS_KEY, RECORDING_SETTINGS_KEY, "chouf_parental_settings", "chouf_language"];
    keys.forEach(k => { try { data[k] = JSON.parse(localStorage.getItem(k) || "null"); } catch {} });
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "chouf_settings.json"; a.click();
    URL.revokeObjectURL(url);
    toast.success(t("msg.settings_exported"));
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string);
        Object.entries(data).forEach(([k, v]) => {
          if (v !== null) localStorage.setItem(k, typeof v === "string" ? v : JSON.stringify(v));
        });
        toast.success(t("msg.settings_imported"));
        window.location.reload();
      } catch {
        toast.error("Invalid file");
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (!confirm(t("msg.reset_confirm"))) return;
    const keys = [PLAYER_SETTINGS_KEY, DISPLAY_SETTINGS_KEY, EPG_SETTINGS_KEY, CATCHUP_SETTINGS_KEY, SETTINGS_KEY, STREAM_SETTINGS_KEY, INTERFACE_SETTINGS_KEY, REFRESH_SETTINGS_KEY, RECORDING_SETTINGS_KEY, "chouf_parental_settings", DASHBOARD_SETTINGS_KEY];
    keys.forEach(k => localStorage.removeItem(k));
    toast.success(t("msg.settings_reset"));
    window.location.reload();
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

  const DEFAULT_HIDDEN_CATS = ["Adult", "XXX", "+18", "Pour adultes", "Adults"];

  const sections = [
    // ── General ──
    {
      id: "general", icon: Globe, label: t("settings.general"), subtitle: t("s.language"),
      color: "#34C759",
      content: (
        <div className="space-y-0">
          <SettingRow label={t("s.language")} subtitle={t("s.language_sub")}>
            <select value={lang} onChange={e => { setLang(e.target.value as Lang); }}
              className="rounded-xl px-3 py-2 text-[12px] font-medium border-0 outline-none cursor-pointer"
              style={{ background: "#1C1C24", color: "#F5F5F7" }}>
              {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.flag} {l.label}</option>)}
            </select>
          </SettingRow><Divider />
          <SettingRow label={t("s.start_page")} subtitle={t("s.start_page_sub")}>
            <SelectField value={startPage} onChange={setStartPage}
              options={[{ value: "home", label: t("misc.home") }, { value: "live", label: t("nav.live") }, { value: "last", label: t("misc.last_channel") }]} />
          </SettingRow><Divider />
          <SettingRow label={t("s.auto_update")} subtitle={t("s.auto_update_sub")}>
            <SelectField value={autoUpdate} onChange={setAutoUpdate}
              options={[{ value: "never", label: t("misc.never") }, { value: "1", label: "1h" }, { value: "6", label: "6h" }, { value: "12", label: "12h" }, { value: "24", label: "24h" }]} />
          </SettingRow><Divider />
          <SettingRow label="Mise à jour playlists" subtitle="Fréquence de rafraîchissement automatique">
            <SelectField value={refreshInterval} onChange={setRefreshInterval}
              options={[
                { value: "1", label: "1 jour" },
                { value: "3", label: "3 jours" },
                { value: "7", label: "7 jours" },
                { value: "30", label: "1 mois" },
              ]} />
          </SettingRow>
        </div>
      ),
    },
    // ── Player ──
    {
      id: "player", icon: PlayCircle, label: t("settings.player"), subtitle: t("s.hw_decode") + ", " + t("s.quality"),
      color: "#FF6D00", badge: "PRO",
      content: (
        <div className="space-y-0">
          <SettingRow label={t("s.format")} subtitle={t("s.format_sub")}>
            <SelectField value={streamFormat} onChange={setStreamFormat}
              options={[{ value: "auto", label: t("misc.auto") }, { value: "hls", label: "HLS (.m3u8)" }, { value: "ts", label: "MPEG-TS (.ts)" }]} />
          </SettingRow><Divider />
          <SettingRow label={t("s.quality")} subtitle={t("s.quality_sub")}>
            <SelectField value={preferredQuality} onChange={setPreferredQuality}
              options={[{ value: "auto", label: t("misc.auto") }, { value: "360p", label: "360p" }, { value: "480p", label: "480p SD" }, { value: "720p", label: "720p HD" }, { value: "1080p", label: "1080p FHD" }, { value: "4k", label: "4K UHD" }]} />
          </SettingRow><Divider />
          <SettingRow label={t("s.decoder")} subtitle={t("s.decoder_sub")}>
            <SelectField value={decoder} onChange={setDecoder}
              options={[{ value: "hardware", label: t("misc.hardware") }, { value: "software", label: t("misc.software") }]} />
          </SettingRow><Divider />
          <SettingRow label={t("s.buffer")} subtitle={t("s.buffer_sub")}>
            <SelectField value={bufferSize} onChange={setBufferSize}
              options={[{ value: "small", label: t("misc.small") }, { value: "medium", label: t("misc.medium") }, { value: "large", label: t("misc.large") }]} />
          </SettingRow><Divider />
          <SettingRow label={t("s.hw_decode")} subtitle={t("s.hw_decode_sub")}>
            <Toggle checked={hardwareDecoding} onChange={setHardwareDecoding} />
          </SettingRow><Divider />
          <SettingRow label={t("s.resume")} subtitle={t("s.resume_sub")}>
            <Toggle checked={resumePlayback} onChange={setResumePlayback} />
          </SettingRow><Divider />
          <SettingRow label={t("s.aspect")} subtitle={t("s.aspect_sub")}>
            <SelectField value={aspectRatio} onChange={setAspectRatio}
              options={[{ value: "auto", label: t("misc.auto") }, { value: "16:9", label: "16:9" }, { value: "4:3", label: "4:3" }, { value: "fill", label: "Fill" }]} />
          </SettingRow>
        </div>
      ),
    },
    // ── Stream ──
    {
      id: "stream", icon: Wifi, label: t("settings.stream"), subtitle: "Timeout, User-Agent, retry",
      color: "#5856D6",
      content: (
        <div className="space-y-0">
          <SettingRow label="Type de flux" subtitle={t("s.format_sub")}>
            <SelectField value={streamType} onChange={setStreamType}
              options={[{ value: "auto", label: t("misc.auto") }, { value: "hls", label: "HLS" }, { value: "ts", label: "MPEG-TS" }, { value: "mpegts", label: "mpegts.js" }]} />
          </SettingRow><Divider />
          <SettingRow label={`Timeout : ${connectionTimeout}s`} subtitle="Délai de connexion max">
            <input type="range" min={5} max={60} value={connectionTimeout} onChange={e => setConnectionTimeout(+e.target.value)} className="w-28 accent-[#5856D6]" />
          </SettingRow><Divider />
          <SettingRow label="Réessayer en cas d'erreur" subtitle="Reconnecter automatiquement">
            <Toggle checked={retryOnError} onChange={setRetryOnError} color="#5856D6" />
          </SettingRow><Divider />
          <SettingRow label="User-Agent" subtitle="Identifiant serveur">
            <SelectField value={userAgent} onChange={setUserAgent}
              options={[{ value: "default", label: "Par défaut" }, { value: "vlc", label: "VLC" }, { value: "tivimate", label: "TiviMate" }, { value: "custom", label: t("misc.custom") }]} />
          </SettingRow>
        </div>
      ),
    },
    // ── Interface ──
    {
      id: "display", icon: Monitor, label: t("settings.display"), subtitle: t("s.logos") + ", " + t("s.channel_style"),
      color: "#007AFF",
      content: (
        <div className="space-y-0">
          <SettingRow label={t("s.channel_style")} subtitle={t("s.channel_style_sub")}>
            <div className="flex gap-1.5">
              {[{ v: "classic", l: t("misc.classic") }, { v: "normal", l: t("misc.normal") }, { v: "modern", l: t("misc.modern") }].map(o => (
                <button key={o.v} onClick={() => setChannelStyle(o.v)}
                  className="rounded-lg px-2.5 py-1.5 text-[11px] font-medium border transition-all"
                  style={channelStyle === o.v
                    ? { background: "rgba(0,122,255,0.12)", color: "#007AFF", borderColor: "rgba(0,122,255,0.3)" }
                    : { background: "#0A0A0F", color: "#48484A", borderColor: "#1C1C24" }
                  }>
                  {o.l}
                </button>
              ))}
            </div>
          </SettingRow><Divider />
          <SettingRow label={t("s.logos")} subtitle={t("s.logos_sub")}><Toggle checked={showLogos} onChange={setShowLogos} color="#007AFF" /></SettingRow><Divider />
          <SettingRow label={t("s.numbers")} subtitle={t("s.numbers_sub")}><Toggle checked={showNumbers} onChange={setShowNumbers} color="#007AFF" /></SettingRow><Divider />
          <SettingRow label={t("s.compact")} subtitle={t("s.compact_sub")}><Toggle checked={compactMode} onChange={setCompactMode} color="#007AFF" /></SettingRow><Divider />
          <SettingRow label={t("s.clock")} subtitle={t("s.clock_sub")}><Toggle checked={showClock} onChange={setShowClock} color="#007AFF" /></SettingRow><Divider />
          <SettingRow label={t("s.text_size")} subtitle={t("s.text_size_sub")}>
            <SelectField value={textSize} onChange={setTextSize}
              options={[{ value: "small", label: t("misc.small") }, { value: "normal", label: t("misc.normal") }, { value: "large", label: t("misc.large") }]} />
          </SettingRow>
        </div>
      ),
    },
    // ── EPG ──
    {
      id: "epg", icon: Tv, label: t("settings.epg"), subtitle: t("s.epg_enable_sub"),
      color: "#34C759",
      content: (
        <div className="space-y-0">
          <SettingRow label={t("s.epg_enable")} subtitle={t("s.epg_enable_sub")}><Toggle checked={epgEnabled} onChange={setEpgEnabled} color="#34C759" /></SettingRow>
          {epgEnabled && (
            <>
              <Divider />
              <SettingRow label={t("s.epg_source")} subtitle={t("s.epg_source_sub")}>
                <SelectField value={epgSource} onChange={setEpgSource}
                  options={[{ value: "auto", label: t("misc.auto") + " (Xtream)" }, { value: "custom", label: t("misc.custom") + " URL" }]} />
              </SettingRow>
              {epgSource === "custom" && (
                <>
                  <Divider />
                  <div className="pt-3 px-1">
                    <label className="text-[11px] font-medium block mb-1.5" style={{ color: "#86868B" }}>{t("s.epg_url")}</label>
                    <input value={epgUrl} onChange={e => setEpgUrl(e.target.value)}
                      placeholder="https://example.com/epg.xml.gz"
                      className="w-full rounded-xl px-3 py-2.5 text-[12px] border outline-none focus:border-[#34C759] transition-colors"
                      style={{ background: "#0A0A0F", color: "#F5F5F7", borderColor: "#1C1C24" }} />
                  </div>
                </>
              )}
              <Divider />
              <SettingRow label={t("s.epg_offset")} subtitle={t("s.epg_offset_sub")}>
                <SelectField value={epgOffset} onChange={setEpgOffset}
                  options={Array.from({ length: 25 }, (_, i) => ({ value: String(i - 12), label: `${i - 12 >= 0 ? "+" : ""}${i - 12}h` }))} />
              </SettingRow><Divider />
              <SettingRow label={t("s.epg_in_list")} subtitle={t("s.epg_in_list_sub")}><Toggle checked={showEpgInList} onChange={setShowEpgInList} color="#34C759" /></SettingRow>
            </>
          )}
        </div>
      ),
    },
    // ── Catch-up ──
    {
      id: "catchup", icon: RotateCcw, label: t("settings.catchup"), subtitle: t("s.catchup_enable_sub"),
      color: "#FF9500",
      content: (
        <div className="space-y-0">
          <SettingRow label={t("s.catchup_enable")} subtitle={t("s.catchup_enable_sub")}><Toggle checked={catchupEnabled} onChange={setCatchupEnabled} color="#FF9500" /></SettingRow>
          {catchupEnabled && (
            <>
              <Divider />
              <SettingRow label={t("s.catchup_duration")} subtitle={t("s.catchup_duration_sub")}>
                <SelectField value={catchupDuration} onChange={setCatchupDuration}
                  options={[{ value: "24", label: "24h" }, { value: "48", label: "48h" }, { value: "72", label: "72h" }]} />
              </SettingRow>
            </>
          )}
        </div>
      ),
    },
    // ── Matchs ──
    {
      id: "matchs", icon: Trophy, label: t("settings.matchs"), subtitle: "Bannière matchs et compétitions",
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
    // ── Parental Control ──
    {
      id: "parental", icon: Lock, label: t("settings.parental"), subtitle: t("s.parental_enable_sub"),
      color: "#FF3B30",
      content: (
        <div className="space-y-0">
          <SettingRow label={t("s.parental_enable")} subtitle={t("s.parental_enable_sub")}>
            <Toggle checked={parental.enabled} onChange={v => setParental(p => ({ ...p, enabled: v }))} color="#FF3B30" />
          </SettingRow>
          {parental.enabled && (
            <>
              <Divider />
              <div className="pt-3 px-1">
                <label className="text-[11px] font-medium block mb-2" style={{ color: "#86868B" }}>{t("s.parental_pin")}</label>
                <PinInput value={parental.pin} onChange={pin => setParental(p => ({ ...p, pin }))} />
              </div>
              <Divider />
              <div className="pt-3 px-1">
                <label className="text-[11px] font-medium block mb-2" style={{ color: "#86868B" }}>{t("s.parental_cats")}</label>
                <p className="text-[10px] mb-2" style={{ color: "#48484A" }}>{t("s.parental_cats_sub")}</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  {DEFAULT_HIDDEN_CATS.map(cat => {
                    const active = parental.hiddenCategories.includes(cat);
                    return (
                      <button key={cat} onClick={() => {
                        setParental(p => ({
                          ...p,
                          hiddenCategories: active
                            ? p.hiddenCategories.filter(c => c !== cat)
                            : [...p.hiddenCategories, cat]
                        }));
                      }}
                        className="rounded-lg px-3 py-1.5 text-[11px] font-medium border transition-all"
                        style={active
                          ? { background: "rgba(255,59,48,0.12)", color: "#FF3B30", borderColor: "rgba(255,59,48,0.3)" }
                          : { background: "#0A0A0F", color: "#48484A", borderColor: "#1C1C24" }
                        }>
                        {active ? "🔒 " : ""}{cat}
                      </button>
                    );
                  })}
                </div>
                {parental.customCategories.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {parental.customCategories.map(cat => (
                      <span key={cat} className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-medium"
                        style={{ background: "rgba(255,59,48,0.12)", color: "#FF3B30", border: "1px solid rgba(255,59,48,0.3)" }}>
                        🔒 {cat}
                        <button onClick={() => removeCustomCategory(cat)} className="hover:opacity-70"><X size={12} /></button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <input value={customCatInput} onChange={e => setCustomCatInput(e.target.value)}
                    placeholder={t("s.parental_custom")}
                    onKeyDown={e => e.key === "Enter" && addCustomCategory()}
                    className="flex-1 rounded-xl px-3 py-2 text-[12px] border outline-none focus:border-[#FF3B30] transition-colors"
                    style={{ background: "#0A0A0F", color: "#F5F5F7", borderColor: "#1C1C24" }} />
                  <button onClick={addCustomCategory} className="rounded-xl px-3 py-2 text-[12px] font-medium transition-colors"
                    style={{ background: "rgba(255,59,48,0.12)", color: "#FF3B30" }}>
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      ),
    },
    // ── Recording ──
    {
      id: "recording", icon: HardDrive, label: t("settings.recording"), subtitle: t("s.rec_quality"),
      color: "#FF3B30",
      content: (
        <div className="space-y-0">
          <SettingRow label={t("s.rec_quality")} subtitle={t("s.rec_quality_sub")}>
            <SelectField value={recQuality} onChange={setRecQuality}
              options={[{ value: "original", label: t("misc.original") }, { value: "high", label: t("misc.high") }, { value: "medium", label: t("misc.medium") }]} />
          </SettingRow><Divider />
          <div className="px-1 py-3">
            <div className="flex items-center gap-2 rounded-xl px-3 py-3" style={{ background: "#0A0A0F", border: "1px solid #1C1C24" }}>
              <Smartphone size={16} style={{ color: "#48484A" }} />
              <p className="text-[11px]" style={{ color: "#86868B" }}>{t("msg.android_only")}</p>
            </div>
          </div>
        </div>
      ),
    },
    // ── Backup ──
    {
      id: "backup", icon: Save, label: t("settings.backup"), subtitle: t("s.export") + " / " + t("s.import"),
      color: "#5856D6",
      content: (
        <div className="space-y-2 px-1 py-2">
          <button onClick={handleExport}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-[13px] font-medium transition-colors"
            style={{ background: "#0A0A0F", color: "#5856D6", border: "1px solid #1C1C24" }}>
            <FileDown size={18} />
            <div className="text-left">
              <p>{t("s.export")}</p>
              <p className="text-[10px] font-normal" style={{ color: "#48484A" }}>{t("s.export_sub")}</p>
            </div>
          </button>
          <button onClick={() => fileInputRef.current?.click()}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-[13px] font-medium transition-colors"
            style={{ background: "#0A0A0F", color: "#34C759", border: "1px solid #1C1C24" }}>
            <FileUp size={18} />
            <div className="text-left">
              <p>{t("s.import")}</p>
              <p className="text-[10px] font-normal" style={{ color: "#48484A" }}>{t("s.import_sub")}</p>
            </div>
          </button>
          <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
          <Divider />
          <button onClick={handleReset}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-[13px] font-medium transition-colors"
            style={{ background: "rgba(255,59,48,0.06)", color: "#FF3B30", border: "1px solid rgba(255,59,48,0.2)" }}>
            <Trash2 size={18} />
            <div className="text-left">
              <p>{t("s.reset")}</p>
              <p className="text-[10px] font-normal" style={{ color: "#48484A" }}>{t("s.reset_sub")}</p>
            </div>
          </button>
        </div>
      ),
    },
    // ── About ──
    {
      id: "about", icon: Info, label: t("settings.about"), subtitle: "Version, I-Success",
      color: "#86868B",
      content: (
        <div className="space-y-3">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF6D00] to-[#FFD60A]">
              <span className="text-lg font-bold text-white">CP</span>
            </div>
            <div>
              <h3 className="text-base font-bold" style={{ color: "#F5F5F7" }}>CHOUF<span className="font-light" style={{ color: "#FF6D00" }}>Play</span></h3>
              <p className="text-[11px]" style={{ color: "#48484A" }}>IPTV Player</p>
            </div>
          </div>
          <div className="space-y-1.5">
            {[
              { icon: Code, label: t("s.version"), value: "2.0.0" },
              { icon: Info, label: t("s.developer"), value: "I-Success" },
              { icon: Globe, label: t("s.website"), value: "choufplay.app" },
              { icon: Mail, label: t("s.contact"), value: "support@choufplay.app" },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-3 rounded-xl px-3 py-2.5" style={{ background: "#0A0A0F" }}>
                <item.icon size={14} style={{ color: "#48484A" }} className="shrink-0" />
                <span className="text-[12px]" style={{ color: "#86868B" }}>{item.label}</span>
                <span className="ml-auto text-[12px] font-medium" style={{ color: "#F5F5F7" }}>{item.value}</span>
              </div>
            ))}
          </div>
          <Divider />
          <div className="space-y-1.5">
            <button onClick={() => navigate("/privacy")} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[12px] transition-colors hover:bg-[#1C1C24]" style={{ color: "#86868B" }}>
              <Shield size={14} /><span>{t("s.privacy")}</span><ChevronRight size={14} className="ml-auto" style={{ color: "#48484A" }} />
            </button>
            <button onClick={() => navigate("/terms")} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[12px] transition-colors hover:bg-[#1C1C24]" style={{ color: "#86868B" }}>
              <Info size={14} /><span>{t("s.terms")}</span><ChevronRight size={14} className="ml-auto" style={{ color: "#48484A" }} />
            </button>
          </div>
          <Divider />
          <p className="text-[10px] px-1 py-2 leading-relaxed" style={{ color: "#48484A" }}>{t("s.disclaimer")}</p>
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
          <h1 className="text-lg font-bold" style={{ color: "#F5F5F7" }}>{t("settings.title")}</h1>
          <p className="text-[10px]" style={{ color: "#48484A" }}>{t("settings.subtitle")}</p>
        </div>
        {parental.enabled && <Lock size={16} className="ml-auto" style={{ color: "#FF3B30" }} />}
      </header>

      <div className="mx-auto max-w-2xl p-4 sm:p-6 space-y-2">
        {/* Group: Général */}
        <p className="text-[10px] font-bold uppercase tracking-widest px-2 pt-2 pb-1" style={{ color: "#48484A" }}>{t("settings.general")}</p>
        {sections.filter(s => s.id === "general").map(section => (
          <section key={section.id} className="rounded-2xl overflow-hidden" style={{ background: "#131318", border: "1px solid #1C1C24" }}>
            <SectionHeader icon={section.icon} label={section.label} subtitle={section.subtitle}
              color={section.color} active={activeSection === section.id} onClick={() => toggleSection(section.id)} badge={section.badge} />
            {activeSection === section.id && (
              <div className="px-4 pb-4" style={{ borderTop: "1px solid #1C1C24" }}><div className="pt-2">{section.content}</div></div>
            )}
          </section>
        ))}

        {/* Group: Lecture */}
        <p className="text-[10px] font-bold uppercase tracking-widest px-2 pt-4 pb-1" style={{ color: "#48484A" }}>Lecture</p>
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
        {sections.filter(s => s.id === "display").map(section => (
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
        {sections.filter(s => ["epg", "catchup", "matchs"].includes(s.id)).map(section => (
          <section key={section.id} className="rounded-2xl overflow-hidden" style={{ background: "#131318", border: "1px solid #1C1C24" }}>
            <SectionHeader icon={section.icon} label={section.label} subtitle={section.subtitle}
              color={section.color} active={activeSection === section.id} onClick={() => toggleSection(section.id)} />
            {activeSection === section.id && (
              <div className="px-4 pb-4" style={{ borderTop: "1px solid #1C1C24" }}><div className="pt-2">{section.content}</div></div>
            )}
          </section>
        ))}

        {/* Group: Sécurité */}
        <p className="text-[10px] font-bold uppercase tracking-widest px-2 pt-4 pb-1" style={{ color: "#48484A" }}>Sécurité</p>
        {sections.filter(s => ["parental", "recording"].includes(s.id)).map(section => (
          <section key={section.id} className="rounded-2xl overflow-hidden" style={{ background: "#131318", border: "1px solid #1C1C24" }}>
            <SectionHeader icon={section.icon} label={section.label} subtitle={section.subtitle}
              color={section.color} active={activeSection === section.id} onClick={() => toggleSection(section.id)} />
            {activeSection === section.id && (
              <div className="px-4 pb-4" style={{ borderTop: "1px solid #1C1C24" }}><div className="pt-2">{section.content}</div></div>
            )}
          </section>
        ))}

        {/* Group: Maintenance */}
        <p className="text-[10px] font-bold uppercase tracking-widest px-2 pt-4 pb-1" style={{ color: "#48484A" }}>Maintenance</p>
        {sections.filter(s => s.id === "backup").map(section => (
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
