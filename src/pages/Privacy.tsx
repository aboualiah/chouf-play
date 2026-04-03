import { ArrowLeft, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Privacy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-card/80 backdrop-blur-sm px-4 py-3 sm:px-6">
        <button onClick={() => navigate("/")} className="rounded-lg bg-secondary p-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-lg font-bold text-foreground">Politique de confidentialité</h1>
      </header>

      <div className="mx-auto max-w-2xl p-4 sm:p-6">
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15">
              <Shield size={20} className="text-primary" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Confidentialité</h2>
              <p className="text-[11px] text-muted-foreground">Dernière mise à jour : avril 2026</p>
            </div>
          </div>

          <p className="text-sm text-foreground/80 leading-relaxed">
            <strong className="text-foreground">CHOUF Play</strong> ne collecte aucune donnée personnelle.
          </p>
          <p className="text-sm text-foreground/80 leading-relaxed">
            Toutes les données (playlists, favoris, préférences) sont stockées localement sur votre appareil
            via le mécanisme <span className="font-mono text-xs text-primary">localStorage</span> de votre navigateur.
          </p>
          <p className="text-sm text-foreground/80 leading-relaxed">
            Aucune information n'est transmise à des serveurs tiers, à l'exception des requêtes nécessaires
            au chargement des flux vidéo et des playlists que vous ajoutez vous-même.
          </p>
          <p className="text-sm text-foreground/80 leading-relaxed">
            L'application utilise un proxy CORS public uniquement pour contourner les restrictions de cross-origin
            lors du chargement de playlists M3U/Xtream.
          </p>

          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Développeur : <span className="text-foreground">I-Success</span> · Contact : <span className="text-foreground">support@choufplay.app</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
