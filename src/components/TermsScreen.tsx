import { useState } from "react";
import { motion } from "framer-motion";
import { ScrollText } from "lucide-react";

interface TermsScreenProps {
  onAccept: () => void;
}

export function TermsScreen({ onAccept }: TermsScreenProps) {
  const [accepted, setAccepted] = useState(false);

  return (
    <div className="flex h-screen w-full items-center justify-center" style={{ background: "#12121A" }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg px-6 flex flex-col"
        style={{ maxHeight: "90vh" }}
      >
        <div className="flex items-center gap-3 mb-4 shrink-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "rgba(201,168,76,0.12)" }}>
            <ScrollText size={20} style={{ color: "#C9A84C" }} />
          </div>
          <h1 className="text-[18px] font-bold" style={{ color: "#F5F5F7" }}>
            Conditions d'utilisation
          </h1>
        </div>

        <div
          className="rounded-xl p-4 mb-4 overflow-y-auto scrollbar-thin text-[11px] leading-relaxed shrink"
          style={{ background: "#1A1A24", border: "1px solid #252530", color: "#86868B", maxHeight: "40vh" }}
        >
          <p className="mb-3">
            <strong style={{ color: "#F5F5F7" }}>CHOUF Play</strong> est un lecteur multimédia IPTV. L'application ne fournit, n'héberge et ne distribue aucun contenu audiovisuel.
          </p>
          <p className="mb-3">
            L'utilisateur est seul responsable des playlists, liens et flux qu'il ajoute dans l'application. Il lui incombe de s'assurer qu'il dispose des droits nécessaires pour accéder aux contenus qu'il utilise via CHOUF Play.
          </p>
          <p className="mb-3">
            CHOUF Play ne collecte ni ne stocke aucune donnée personnelle sur ses serveurs. Toutes les données (playlists, paramètres, favoris, historique) sont enregistrées exclusivement en local sur l'appareil de l'utilisateur.
          </p>
          <p className="mb-3">
            L'application est fournie « telle quelle », sans garantie d'aucune sorte. L'équipe CHOUF Play décline toute responsabilité quant à l'utilisation qui est faite de l'application ou des contenus auxquels l'utilisateur accède.
          </p>
          <p>
            En utilisant CHOUF Play, vous acceptez ces conditions dans leur intégralité.
          </p>
        </div>

        <label className="flex items-center gap-3 mb-4 cursor-pointer group shrink-0">
          <div
            onClick={() => setAccepted(!accepted)}
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md transition-all"
            style={{
              background: accepted ? "#FF6D00" : "transparent",
              border: accepted ? "none" : "2px solid #48484A",
            }}
          >
            {accepted && (
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2.5 6L5 8.5L9.5 3.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
          <span className="text-[12px] font-medium" style={{ color: "#86868B" }}>
            J'ai lu et j'accepte les conditions d'utilisation
          </span>
        </label>

        <button
          onClick={() => {
            if (accepted) {
              localStorage.setItem("chouf_cgu_accepted", "true");
              onAccept();
            }
          }}
          disabled={!accepted}
          className="w-full rounded-2xl py-3 text-[14px] font-bold transition-all shrink-0"
          style={{
            background: accepted ? "linear-gradient(135deg, #FF6D00, #FF8C38)" : "#1C1C24",
            color: accepted ? "#fff" : "#48484A",
            boxShadow: accepted ? "0 8px 32px rgba(255,109,0,0.3)" : "none",
            cursor: accepted ? "pointer" : "not-allowed",
          }}
        >
          Continuer
        </button>
      </motion.div>
    </div>
  );
}
