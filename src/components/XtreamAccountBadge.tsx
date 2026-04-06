import { AlertTriangle, Wifi, Monitor, Calendar, Shield, Copy, Check } from "lucide-react";
import { Playlist } from "@/lib/storage";
import { useState } from "react";
import { colors, effects } from "@/lib/theme";

interface XtreamAccountBadgeProps {
  playlist: Playlist;
}

export function XtreamAccountBadge({ playlist }: XtreamAccountBadgeProps) {
  const [copied, setCopied] = useState(false);
  if (!playlist.isXtream) return null;

  const info = playlist.xtreamAccountInfo;
  const mac = playlist.xtreamMac || "—";

  // Debug: log raw account info
  console.log("[XtreamBadge] accountInfo:", JSON.stringify(info));
  
  // Handle exp_date: could be string timestamp, number, or date string
  let expiresAt: Date | null = null;
  if (info?.exp_date) {
    const raw = info.exp_date;
    console.log("[XtreamBadge] raw exp_date:", raw, "type:", typeof raw);
    const num = Number(raw);
    if (!Number.isNaN(num) && num > 0) {
      // Unix timestamp (seconds or milliseconds)
      expiresAt = new Date(num > 1e12 ? num : num * 1000);
    } else if (typeof raw === "string" && raw.length > 0) {
      expiresAt = new Date(raw);
    }
  }
  
  const isValidExpiry = expiresAt instanceof Date && !Number.isNaN(expiresAt.getTime());
  const daysRemaining = isValidExpiry ? Math.ceil((expiresAt!.getTime() - Date.now()) / 86400000) : null;
  const isExpired = daysRemaining !== null ? daysRemaining < 0 : info?.status?.toLowerCase() === "expired";
  const isWarning = daysRemaining !== null && daysRemaining >= 0 && daysRemaining < 7;

  const statusEmoji = isExpired ? "🔴" : isWarning ? "🟠" : "🟢";
  const statusLabel = isExpired ? "Expiré" : info?.status || "Actif";
  const statusColor = isExpired ? "#FF3B30" : isWarning ? "#FF9F0A" : colors.green;
  const expiresLabel = isValidExpiry
    ? expiresAt!.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" })
    : info?.exp_date ? `Raw: ${info.exp_date}` : "—";

  // Progress bar
  const createdAt = info?.created_at ? new Date(Number(info.created_at) * 1000) : null;
  const totalDays = createdAt && isValidExpiry ? Math.ceil((expiresAt!.getTime() - createdAt.getTime()) / 86400000) : null;
  const progressPct = totalDays && daysRemaining !== null ? Math.max(0, Math.min(100, ((totalDays - Math.max(daysRemaining, 0)) / totalDays) * 100)) : null;

  const handleCopyMac = () => {
    if (mac !== "—") {
      navigator.clipboard.writeText(mac);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <div className="mt-1.5 rounded-xl overflow-hidden" style={{ background: colors.background, border: "1px solid #1C1C24" }}>
      {/* Status header */}
      <div className="flex items-center justify-between px-2.5 py-1.5" style={{ borderBottom: "1px solid #1C1C24" }}>
        <div className="flex items-center gap-1.5">
          <Shield size={10} style={{ color: statusColor }} />
          <span className="text-[10px] font-semibold" style={{ color: statusColor }}>
            {statusEmoji} {statusLabel}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Wifi size={9} style={{ color: colors.textDim }} />
          <span className="text-[9px]" style={{ color: colors.textDim }}>
            Max {info?.max_connections || "—"}
          </span>
        </div>
      </div>

      <div className="px-2.5 py-2 space-y-1.5">
        {/* MAC address */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Monitor size={9} style={{ color: colors.textDim }} />
            <span className="text-[9px] font-mono" style={{ color: colors.textMuted }}>
              {mac}
            </span>
          </div>
          <button onClick={handleCopyMac} className="p-0.5 rounded hover:bg-[#1C1C24] transition-colors">
            {copied ? <Check size={9} style={{ color: colors.green }} /> : <Copy size={9} style={{ color: colors.textDim }} />}
          </button>
        </div>

        {/* Expiration */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Calendar size={9} style={{ color: isWarning ? "#FF9F0A" : colors.textDim }} />
            <span className="text-[9px]" style={{ color: isWarning ? "#FF9F0A" : colors.textMuted }}>
              {expiresLabel}
            </span>
          </div>
          <span className="text-[9px] font-semibold" style={{ color: isWarning ? "#FF9F0A" : isExpired ? "#FF3B30" : colors.textMuted }}>
            {daysRemaining !== null ? `${Math.max(daysRemaining, 0)}j` : "—"}
          </span>
        </div>

        {/* Progress bar */}
        {progressPct !== null && (
          <div className="h-1 rounded-full overflow-hidden" style={{ background: colors.surfaceSolid2 }}>
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${progressPct}%`,
                background: isExpired ? "#FF3B30" : isWarning ? "#FF9F0A" : colors.green,
              }}
            />
          </div>
        )}

        {/* Warning */}
        {isWarning && (
          <div className="flex items-center gap-1 text-[9px] pt-0.5" style={{ color: colors.warning }}>
            <AlertTriangle size={9} />
            <span>Expiration dans {daysRemaining}j</span>
          </div>
        )}
      </div>
    </div>
  );
}
