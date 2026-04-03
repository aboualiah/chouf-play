import { ArrowLeft, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Terms() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-card/80 backdrop-blur-sm px-4 py-3 sm:px-6">
        <button onClick={() => navigate("/")} className="rounded-lg bg-secondary p-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-lg font-bold text-foreground">Conditions d'utilisation</h1>
      </header>

      <div className="mx-auto max-w-2xl p-4 sm:p-6">
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/15">
              <FileText size={20} className="text-accent" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Conditions</h2>
              <p className="text-[11px] text-muted-foreground">Dernière mise à jour : avril 2026</p>
            </div>
          </div>

          <p className="text-sm text-foreground/80 leading-relaxed">
            <strong className="text-foreground">CHOUF Play</strong> est un lecteur IPTV.
          </p>
          <p className="text-sm text-foreground/80 leading-relaxed">
            L'utilisateur est entièrement responsable du contenu qu'il ajoute via ses propres playlists.
            CHOUF Play ne fournit, n'héberge et ne distribue aucun contenu audiovisuel.
          </p>
          <p className="text-sm text-foreground/80 leading-relaxed">
            L'application est fournie "telle quelle", sans garantie d'aucune sorte. L'utilisateur assume
            tous les risques liés à l'utilisation de l'application.
          </p>
          <p className="text-sm text-foreground/80 leading-relaxed">
            L'utilisation de l'application implique l'acceptation de ces conditions. En cas de non-respect
            des lois applicables, l'utilisateur est seul responsable.
          </p>

          <div className="pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground">
              Développeur : <span className="text-foreground">I-Success</span> · Site : <span className="text-foreground">choufplay.app</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
