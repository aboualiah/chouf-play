import React, { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { Channel } from "@/lib/channels";
import { Play, Pause, Volume2, VolumeX, Radio, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface RadioPlayerProps {
  channels: Channel[];
  onPlay: (ch: Channel) => void;
}

// Animated bars CSS
const barAnimation = `
@keyframes radioBar1 { 0%,100%{height:4px} 50%{height:16px} }
@keyframes radioBar2 { 0%,100%{height:8px} 50%{height:20px} }
@keyframes radioBar3 { 0%,100%{height:12px} 50%{height:6px} }
@keyframes radioBar4 { 0%,100%{height:6px} 50%{height:18px} }
@keyframes radioBar5 { 0%,100%{height:10px} 50%{height:4px} }
`;

function AnimatedBars({ playing }: { playing: boolean }) {
  return (
    <>
      <style>{barAnimation}</style>
      <div className="flex items-end gap-[2px] h-5">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="w-[3px] rounded-full transition-all"
            style={{
              background: "linear-gradient(to top, #FF6D00, #FFD60A)",
              height: playing ? undefined : "4px",
              animation: playing ? `radioBar${i} ${0.4 + i * 0.1}s ease-in-out infinite` : "none",
            }} />
        ))}
      </div>
    </>
  );
}

// Mini player that persists across navigation
export function RadioMiniPlayer({ station, playing, onToggle, onClose, volume, onVolumeChange }: {
  station: Channel | null; playing: boolean; onToggle: () => void; onClose: () => void;
  volume: number; onVolumeChange: (v: number) => void;
}) {
  const [showVolume, setShowVolume] = useState(false);

  if (!station) return null;

  return (
    <motion.div initial={{ y: 60 }} animate={{ y: 0 }} exit={{ y: 60 }}
      className="fixed bottom-0 left-0 right-0 z-40 flex items-center gap-3 px-4 py-2.5"
      style={{ background: "rgba(19,19,24,0.95)", backdropFilter: "blur(20px)", borderTop: "1px solid #1C1C24" }}>
      <AnimatedBars playing={playing} />
      <Radio size={16} style={{ color: "#34C759" }} />
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-semibold truncate" style={{ color: "#F5F5F7" }}>{station.name}</p>
        <p className="text-[9px]" style={{ color: "#48484A" }}>{station.category}</p>
      </div>

      <button onClick={onToggle}
        className="flex h-8 w-8 items-center justify-center rounded-full transition-transform hover:scale-110"
        style={{ background: "linear-gradient(135deg, #FF6D00, #FFD60A)" }}>
        {playing ? <Pause size={14} className="text-black" /> : <Play size={14} className="text-black" fill="currentColor" />}
      </button>

      <div className="relative">
        <button onClick={() => setShowVolume(!showVolume)}
          className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-[#1C1C24] transition-colors">
          {volume === 0 ? <VolumeX size={14} style={{ color: "#86868B" }} /> : <Volume2 size={14} style={{ color: "#86868B" }} />}
        </button>
        {showVolume && (
          <div className="absolute bottom-full right-0 mb-2 p-2 rounded-lg" style={{ background: "#1C1C24" }}>
            <input type="range" min={0} max={1} step={0.05} value={volume}
              onChange={e => onVolumeChange(Number(e.target.value))}
              className="h-1 w-20 accent-[#FF6D00]" />
          </div>
        )}
      </div>

      <button onClick={onClose} className="hover:bg-[#1C1C24] rounded-full p-1 transition-colors">
        <X size={14} style={{ color: "#48484A" }} />
      </button>
    </motion.div>
  );
}

// Radio list view
export function RadioList({ channels, activeStation, onSelect }: {
  channels: Channel[]; activeStation: Channel | null; onSelect: (ch: Channel) => void;
}) {
  const radioChannels = useMemo(() =>
    channels.filter(c => c.category?.toLowerCase().includes("radio")),
    [channels]
  );

  // Group by category - must be before any early returns
  const grouped = useMemo(() => {
    const map = new Map<string, Channel[]>();
    radioChannels.forEach(c => {
      const cat = c.category || "Radio";
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(c);
    });
    return Array.from(map.entries());
  }, [radioChannels]);

  if (radioChannels.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 p-8 gap-3">
        <Radio size={40} style={{ color: "#48484A" }} />
        <p className="text-[13px]" style={{ color: "#48484A" }}>Aucune station radio trouvée</p>
        <p className="text-[11px] text-center" style={{ color: "#48484A" }}>
          Les stations radio apparaîtront ici quand votre playlist contient des catégories "Radio"
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin">
      <div className="flex items-center gap-2 px-5 py-3">
        <Radio size={16} style={{ color: "#34C759" }} />
        <span className="text-[14px] font-bold" style={{ color: "#F5F5F7" }}>Radio en ligne</span>
        <span className="text-[11px]" style={{ color: "#48484A" }}>{radioChannels.length} stations</span>
      </div>

      {grouped.map(([cat, stations]) => (
        <div key={cat} className="mb-3">
          <h3 className="px-5 mb-1 text-[11px] font-semibold uppercase tracking-wider" style={{ color: "#48484A" }}>{cat}</h3>
          <div className="space-y-0.5 px-3">
            {stations.map(s => (
              <button key={s.id} onClick={() => onSelect(s)}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-[#1C1C24]"
                style={activeStation?.id === s.id ? { background: "rgba(52,199,89,0.08)", borderLeft: "2px solid #34C759" } : {}}>
                <Radio size={14} style={{ color: activeStation?.id === s.id ? "#34C759" : "#48484A" }} />
                <span className="flex-1 text-left text-[12px] font-medium truncate"
                  style={{ color: activeStation?.id === s.id ? "#F5F5F7" : "#B0B0B5" }}>{s.name}</span>
                {activeStation?.id === s.id && <AnimatedBars playing={true} />}
                <Play size={12} style={{ color: "#48484A" }} />
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// Hook to manage radio audio
export function useRadioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [radioStation, setRadioStation] = useState<Channel | null>(null);
  const [radioPlaying, setRadioPlaying] = useState(false);
  const [radioVolume, setRadioVolume] = useState(0.7);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.volume = radioVolume;
    }
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = radioVolume;
  }, [radioVolume]);

  const playRadio = useCallback((station: Channel) => {
    const audio = audioRef.current;
    if (!audio) return;
    if (radioStation?.id === station.id) {
      // Toggle
      if (radioPlaying) { audio.pause(); setRadioPlaying(false); }
      else { audio.play().catch(() => {}); setRadioPlaying(true); }
      return;
    }
    audio.pause();
    audio.src = station.url;
    audio.play().then(() => {
      setRadioStation(station);
      setRadioPlaying(true);
    }).catch(() => {
      setRadioStation(station);
      setRadioPlaying(false);
    });
  }, [radioStation, radioPlaying]);

  const toggleRadio = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !radioStation) return;
    if (radioPlaying) { audio.pause(); setRadioPlaying(false); }
    else { audio.play().catch(() => {}); setRadioPlaying(true); }
  }, [radioStation, radioPlaying]);

  const stopRadio = useCallback(() => {
    audioRef.current?.pause();
    if (audioRef.current) audioRef.current.src = "";
    setRadioStation(null);
    setRadioPlaying(false);
  }, []);

  return { radioStation, radioPlaying, radioVolume, setRadioVolume, playRadio, toggleRadio, stopRadio };
}
