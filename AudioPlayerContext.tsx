import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { getCachedAudio, saveCachedAudio } from '../lib/offlineDb';
import { AppLanguage, AudioTrack } from '../types/agri';

interface AudioPlayerContextValue {
  currentTrack: AudioTrack | null;
  isPlaying: boolean;
  isLoading: boolean;
  engineMode: 'ai' | 'offline';
  playbackRate: number;
  progress: number;
  duration: number;
  playTrack: (track: AudioTrack) => Promise<void>;
  togglePlayPause: () => void;
  stop: () => void;
  setPlaybackRate: (rate: number) => void;
  seekToRatio: (ratio: number) => void;
}

const AudioPlayerContext = createContext<AudioPlayerContextValue | null>(null);

function hashTrackKey(track: AudioTrack): string {
  return `${track.language}:${track.id}:${track.text.slice(0, 60)}`;
}

function langToSpeechLocale(lang: AppLanguage): string {
  if (lang === 'bn') return 'bn-BD';
  if (lang === 'hi') return 'hi-IN';
  return 'en-US';
}

export const AudioPlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState<AudioTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [engineMode, setEngineMode] = useState<'ai' | 'offline'>('ai');
  const [playbackRate, setPlaybackRateState] = useState(1);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const speechIntervalRef = useRef<number | null>(null);

  const cleanupAudioElement = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    if (speechIntervalRef.current) {
      window.clearInterval(speechIntervalRef.current);
      speechIntervalRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  useEffect(() => {
    return () => {
      cleanupAudioElement();
    };
  }, [cleanupAudioElement]);

  const playWithWebSpeech = useCallback(
    (track: AudioTrack, rate: number) => {
      setEngineMode('offline');
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        setIsPlaying(false);
        setIsLoading(false);
        return;
      }

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(track.text);
      utterance.lang = langToSpeechLocale(track.language);
      utterance.rate = rate;

      const voices = window.speechSynthesis.getVoices();
      const langPrefix = track.language === 'bn' ? 'bn' : track.language === 'hi' ? 'hi' : 'en';
      const matchingVoice = voices.find((v) => v.lang.toLowerCase().startsWith(langPrefix));
      if (matchingVoice) {
        utterance.voice = matchingVoice;
      }

      const estimatedSeconds = Math.max(4, Math.round((track.text.length / 11) / rate));
      setDuration(estimatedSeconds);
      setProgress(0);
      setIsLoading(false);
      setIsPlaying(true);

      const startedAt = Date.now();
      speechIntervalRef.current = window.setInterval(() => {
        const elapsed = (Date.now() - startedAt) / 1000;
        setProgress(Math.min(estimatedSeconds, elapsed));
      }, 250);

      utterance.onend = () => {
        if (speechIntervalRef.current) {
          window.clearInterval(speechIntervalRef.current);
          speechIntervalRef.current = null;
        }
        setProgress(estimatedSeconds);
        setIsPlaying(false);
      };
      utterance.onerror = () => {
        if (speechIntervalRef.current) {
          window.clearInterval(speechIntervalRef.current);
          speechIntervalRef.current = null;
        }
        setIsPlaying(false);
      };

      window.speechSynthesis.speak(utterance);
    },
    []
  );

  const playWavBase64 = useCallback(
    (base64Audio: string, mimeType: string, rate: number) => {
      const byteCharacters = atob(base64Audio);
      const byteArray = new Uint8Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i += 1) {
        byteArray[i] = byteCharacters.charCodeAt(i);
      }
      const blob = new Blob([byteArray], { type: mimeType || 'audio/wav' });
      const url = URL.createObjectURL(blob);
      objectUrlRef.current = url;

      const audio = new Audio(url);
      audio.playbackRate = rate;
      audioRef.current = audio;
      setEngineMode('ai');

      audio.onloadedmetadata = () => {
        setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
      };
      audio.ontimeupdate = () => {
        setProgress(audio.currentTime);
      };
      audio.onended = () => {
        setIsPlaying(false);
        setProgress(audio.duration || 0);
      };
      audio.onerror = () => {
        setIsPlaying(false);
      };

      setIsLoading(false);
      setIsPlaying(true);
      audio.play().catch(() => {
        setIsPlaying(false);
      });
    },
    []
  );

  const playTrack = useCallback(
    async (track: AudioTrack) => {
      cleanupAudioElement();
      setCurrentTrack(track);
      setProgress(0);
      setDuration(0);
      setIsLoading(true);

      const cacheKey = hashTrackKey(track);

      try {
        // 1. Check IndexedDB audio cache first (works offline too!)
        const cached = await getCachedAudio(cacheKey);
        if (cached?.audioBase64) {
          playWavBase64(cached.audioBase64, cached.mimeType, playbackRate);
          return;
        }
      } catch {
        // Proceed to network or speech fallback
      }

      // 2. If online, generate natural Gemini TTS audio and cache offline
      if (typeof navigator === 'undefined' || navigator.onLine) {
        try {
          const res = await fetch('/api/tts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: track.text, language: track.language }),
          });
          if (res.ok) {
            const data = await res.json();
            if (data.audioBase64) {
              saveCachedAudio({
                key: cacheKey,
                audioBase64: data.audioBase64,
                mimeType: data.mimeType || 'audio/wav',
                cachedAt: new Date().toISOString(),
              }).catch(() => {});
              playWavBase64(data.audioBase64, data.mimeType || 'audio/wav', playbackRate);
              return;
            }
          }
        } catch {
          // Fall back to offline speech synthesis seamlessly
        }
      }

      // 3. Offline fallback via browser SpeechSynthesis
      playWithWebSpeech(track, playbackRate);
    },
    [cleanupAudioElement, playbackRate, playWavBase64, playWithWebSpeech]
  );

  const togglePlayPause = useCallback(() => {
    if (!currentTrack) return;

    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
      return;
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      if (isPlaying) {
        window.speechSynthesis.cancel();
        if (speechIntervalRef.current) {
          window.clearInterval(speechIntervalRef.current);
          speechIntervalRef.current = null;
        }
        setIsPlaying(false);
      } else {
        playWithWebSpeech(currentTrack, playbackRate);
      }
    }
  }, [currentTrack, isPlaying, playbackRate, playWithWebSpeech]);

  const stop = useCallback(() => {
    cleanupAudioElement();
    setIsPlaying(false);
    setIsLoading(false);
    setProgress(0);
    setCurrentTrack(null);
  }, [cleanupAudioElement]);

  const setPlaybackRate = useCallback((rate: number) => {
    setPlaybackRateState(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  }, []);

  const seekToRatio = useCallback((ratio: number) => {
    if (audioRef.current && Number.isFinite(audioRef.current.duration) && audioRef.current.duration > 0) {
      const target = Math.max(0, Math.min(1, ratio)) * audioRef.current.duration;
      audioRef.current.currentTime = target;
      setProgress(target);
    }
  }, []);

  return (
    <AudioPlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        isLoading,
        engineMode,
        playbackRate,
        progress,
        duration,
        playTrack,
        togglePlayPause,
        stop,
        setPlaybackRate,
        seekToRatio,
      }}
    >
      {children}
    </AudioPlayerContext.Provider>
  );
};

export function useAudioPlayer() {
  const ctx = useContext(AudioPlayerContext);
  if (!ctx) {
    throw new Error('useAudioPlayer must be used within AudioPlayerProvider');
  }
  return ctx;
}
