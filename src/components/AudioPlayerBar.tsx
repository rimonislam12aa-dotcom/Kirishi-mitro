import React from 'react';
import { Loader2, Pause, Play, Square, Volume2 } from 'lucide-react';
import { useAudioPlayer } from '../context/AudioPlayerContext';
import { Translations } from '../catalog/i18n';

interface AudioPlayerBarProps {
  t: Translations;
}

export const AudioPlayerBar: React.FC<AudioPlayerBarProps> = ({ t }) => {
  const {
    currentTrack,
    isPlaying,
    isLoading,
    engineMode,
    playbackRate,
    progress,
    duration,
    togglePlayPause,
    stop,
    setPlaybackRate,
    seekToRatio,
  } = useAudioPlayer();

  if (!currentTrack) {
    return null;
  }

  const ratio = duration > 0 ? Math.min(1, progress / duration) : 0;
  const formatTime = (sec: number) => {
    const s = Math.max(0, Math.round(sec));
    const m = Math.floor(s / 60);
    const rem = s % 60;
    return `${m}:${rem < 10 ? '0' : ''}${rem}`;
  };

  return (
    <aside
      aria-label={t.audio.playerTitle}
      className="fixed bottom-[calc(4.35rem+env(safe-area-inset-bottom))] left-2.5 right-2.5 z-40 mx-auto max-w-2xl rounded-xl border border-stone-300 bg-stone-900 px-3.5 py-3 text-white shadow-xl sm:left-4 sm:right-4 sm:px-4 md:bottom-5"
    >
      <div className="flex items-center justify-between gap-2.5 sm:gap-3">
        <div className="flex min-w-0 flex-1 items-center gap-2.5 sm:gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-800 text-emerald-100">
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Volume2 className="h-5 w-5" />}
          </div>

          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold">{currentTrack.title}</div>
            <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-stone-300">
              <span>{isLoading ? t.audio.loadingVoice : isPlaying ? t.audio.playingNow : t.audio.paused}</span>
              <span aria-hidden="true" className="hidden sm:inline">·</span>
              <span className="hidden sm:inline">{engineMode === 'ai' ? t.audio.aiVoiceBadge : t.audio.offlineVoiceBadge}</span>
              {duration > 0 && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono-tabular">
                    {formatTime(progress)} / {formatTime(duration)}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => {
              const next = playbackRate === 1 ? 1.2 : playbackRate === 1.2 ? 0.85 : 1;
              setPlaybackRate(next);
            }}
            className="min-h-[36px] rounded-md border border-stone-700 px-2 text-xs font-mono-tabular text-stone-200 hover:bg-stone-800"
          >
            {playbackRate}x
          </button>

          <button
            type="button"
            onClick={togglePlayPause}
            disabled={isLoading}
            aria-label={isPlaying ? 'Pause' : 'Play'}
            className="inline-flex min-h-[40px] min-w-[40px] items-center justify-center rounded-lg bg-emerald-700 text-white hover:bg-emerald-600 disabled:opacity-50"
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>

          <button
            type="button"
            onClick={stop}
            aria-label={t.status.stopLabel}
            className="inline-flex min-h-[40px] min-w-[40px] items-center justify-center rounded-lg bg-stone-800 text-stone-300 hover:bg-stone-700"
          >
            <Square className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {duration > 0 && (
        <div
          role="slider"
          aria-label="Audio progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(ratio * 100)}
          tabIndex={0}
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickRatio = (e.clientX - rect.left) / rect.width;
            seekToRatio(clickRatio);
          }}
          className="mt-2.5 h-1.5 w-full cursor-pointer overflow-hidden rounded-full bg-stone-700"
        >
          <div
            className="h-full bg-emerald-400 transition-[width] duration-150"
            style={{ width: `${Math.round(ratio * 100)}%` }}
          />
        </div>
      )}
    </aside>
  );
};
