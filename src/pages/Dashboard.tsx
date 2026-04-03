import { useState, useEffect, useCallback } from "react";
import { ArrowLeft, Plus, Trash2, RefreshCw, Smartphone, Monitor, Link2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getPlaylists, savePlaylists, Playlist } from "@/lib/storage";
import { toast } from "sonner";

const PIN_KEY = "chouf_dashboard_pin";
const LINK_CODE_KEY = "chouf_link_code";

function getPin(): string {
  return localStorage.getItem(PIN_KEY) || "1234";
}

function getLinkCode(): string {
  let code = localStorage.getItem(LINK_CODE_KEY);
  if (!code) {
    code = Math.floor(100000 + Math.random() * 900000).toString();
    localStorage.setItem(LINK_CODE_KEY, code);
  }
  return code;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [authenticated, setAuthenticated] = useState(false);
  const [pin, setPin] = useState("");
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [linkCode] = useState(getLinkCode());

  const refreshPlaylists = useCallback(() => {
    setPlaylists(getPlaylists());
  }, []);

  useEffect(() => {
    if (authenticated) {
      refreshPlaylists();
      const interval = setInterval(refreshPlaylists, 3000);
      return () => clearInterval(interval);
    }
  }, [authenticated, refreshPlaylists]);

  const handlePinSubmit = () => {
    if (pin === getPin()) {
      setAuthenticated(true);
      toast.success("Accès autorisé");
    } else {
      toast.error("Code PIN incorrect");
      setPin("");
    }
  };

  const handlePinKey = (digit: string) => {
    if (digit === "del") {
      setPin(prev => prev.slice(0, -1));
    } else if (digit === "ok") {
      handlePinSubmit();
    } else if (pin.length < 4) {
      const newPin = pin + digit;
      setPin(newPin);
      if (newPin.length === 4) {
        setTimeout(() => {
          if (newPin === getPin()) {
            setAuthenticated(true);
            toast.success("Accès autorisé");
          } else {
            toast.error("Code PIN incorrect");
            setPin("");
          }
        }, 200);
      }
    }
  };

  const handleDeletePlaylist = (id: string) => {
    const updated = playlists.filter(p => p.id !== id);
    savePlaylists(updated);
    setPlaylists(updated);
    toast.success("Playlist supprimée");
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm space-y-8 text-center">
          <div>
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-orange glow-orange mx-auto mb-4">
              <Monitor size={28} className="text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">Entrez le code PIN pour accéder</p>
          </div>

          {/* PIN display */}
          <div className="flex justify-center gap-3">
            {[0, 1, 2, 3].map(i => (
              <div
                key={i}
                className={`h-14 w-14 rounded-xl border-2 flex items-center justify-center text-2xl font-bold transition-all ${
                  pin.length > i ? "border-primary bg-primary/10 text-primary" : "border-border bg-secondary text-muted-foreground"
                }`}
              >
                {pin.length > i ? "•" : ""}
              </div>
            ))}
          </div>

          {/* Numpad */}
          <div className="grid grid-cols-3 gap-3 max-w-[240px] mx-auto">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9", "del", "0", "ok"].map(key => (
              <button
                key={key}
                onClick={() => handlePinKey(key)}
                className={`h-14 rounded-xl text-lg font-semibold transition-all active:scale-95 ${
                  key === "ok"
                    ? "bg-primary text-primary-foreground"
                    : key === "del"
                      ? "bg-destructive/20 text-destructive"
                      : "bg-secondary text-foreground hover:bg-muted"
                }`}
              >
                {key === "del" ? "⌫" : key === "ok" ? "✓" : key}
              </button>
            ))}
          </div>

          <button onClick={() => navigate("/")} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            ← Retour à l'app
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-card/80 backdrop-blur-sm px-4 py-3">
        <button onClick={() => navigate("/")} className="rounded-lg bg-secondary p-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-lg font-bold text-foreground flex-1">Dashboard</h1>
        <button onClick={refreshPlaylists} className="rounded-lg bg-secondary p-2 text-muted-foreground hover:text-foreground transition-colors">
          <RefreshCw size={16} />
        </button>
      </header>

      <div className="mx-auto max-w-lg p-4 space-y-6">
        {/* Link Code */}
        <section className="rounded-xl border border-border bg-card p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Link2 size={16} className="text-primary" />
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Code d'appairage</p>
          </div>
          <p className="text-3xl font-bold tracking-[0.3em] text-primary tabular-nums">{linkCode}</p>
          <p className="text-[11px] text-muted-foreground mt-2">Entrez ce code sur votre téléphone pour lier les appareils</p>
        </section>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Playlists", value: playlists.length, color: "text-primary" },
            { label: "Chaînes", value: playlists.reduce((s, p) => s + p.channels.length, 0), color: "text-success" },
            { label: "VOD", value: playlists.reduce((s, p) => s + (p.vodStreams?.length || 0), 0), color: "text-info" },
          ].map(stat => (
            <div key={stat.label} className="rounded-xl border border-border bg-card p-3 text-center">
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-[10px] text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Playlists */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-foreground">Mes Playlists</p>
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground active:scale-95 transition-transform"
            >
              <Plus size={14} />
              Ajouter
            </button>
          </div>

          {playlists.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-8 text-center">
              <Smartphone size={32} className="text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Aucune playlist</p>
            </div>
          ) : (
            <div className="space-y-2">
              {playlists.map(p => (
                <div key={p.id} className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{p.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {p.channels.length} chaînes
                      {p.vodStreams?.length ? ` • ${p.vodStreams.length} films` : ""}
                      {p.series?.length ? ` • ${p.series.length} séries` : ""}
                    </p>
                    {p.isXtream && (
                      <span className="inline-flex items-center gap-1 mt-1 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-medium text-primary">
                        Xtream
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeletePlaylist(p.id)}
                    className="rounded-lg bg-destructive/15 p-2.5 text-destructive hover:bg-destructive/25 active:scale-95 transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
