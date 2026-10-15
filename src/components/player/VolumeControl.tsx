'use client';

import React from 'react';
import { Volume2, Volume1, VolumeX } from 'lucide-react';

interface VolumeControlProps {
  volume: number;
  isMuted: boolean;
  onVolumeChange: (vol: number) => void;
  onToggleMute: () => void;
  className?: string;
}

export function VolumeControl({
  volume,
  isMuted,
  onVolumeChange,
  onToggleMute,
  className = '',
}: VolumeControlProps) {
  const effectiveVolume = isMuted ? 0 : volume;

  const getVolumeIcon = () => {
    if (isMuted || effectiveVolume === 0) {
      return <VolumeX className="w-4 h-4 text-[#ee7d77]" />;
    }
    if (effectiveVolume < 0.5) {
      return <Volume1 className="w-4 h-4 text-[#a6ada6]" />;
    }
    return <Volume2 className="w-4 h-4 text-[#b9cbba]" />;
  };

  return (
    <div className={`flex items-center gap-2 group select-none ${className}`}>
      <button
        onClick={onToggleMute}
        title={isMuted ? 'Unmute (M)' : 'Mute (M)'}
        className="p-1.5 rounded-full hover:bg-white/10 text-[#a6ada6] hover:text-[#fff8f2] transition-colors"
      >
        {getVolumeIcon()}
      </button>

      <div className="w-20 md:w-24 relative flex items-center h-5">
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={effectiveVolume}
          onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
          className="w-full h-1 group-hover:h-1.5 bg-white/15 rounded-lg appearance-none cursor-pointer focus:outline-none transition-all duration-150"
          style={{
            background: `linear-gradient(to right, #b9cbba 0%, #b9cbba ${effectiveVolume * 100}%, rgba(255, 255, 255, 0.15) ${effectiveVolume * 100}%, rgba(255, 255, 255, 0.15) 100%)`,
          }}
        />
      </div>
    </div>
  );
}
