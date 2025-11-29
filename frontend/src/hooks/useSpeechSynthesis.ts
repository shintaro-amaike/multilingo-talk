import { useState, useCallback, useRef, useEffect } from 'react';

interface UseSpeechSynthesisOptions {
  language?: string;
  rate?: number; // 0.5 - 2.0
  pitch?: number; // 0 - 2
  volume?: number; // 0 - 1
}

interface UseSpeechSynthesisReturn {
  isSupported: boolean;
  isSpeaking: boolean;
  isPaused: boolean;
  speak: (text: string) => void;
  pause: () => void;
  resume: () => void;
  cancel: () => void;
  setRate: (rate: number) => void;
  setVolume: (volume: number) => void;
  error: string | null;
}

const useSpeechSynthesis = (
  options: UseSpeechSynthesisOptions = {}
): UseSpeechSynthesisReturn => {
  const {
    language = 'en-US',
    rate: initialRate = 1,
    pitch: initialPitch = 1,
    volume: initialVolume = 1,
  } = options;

  const [isSupported, setIsSupported] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rate, setRateState] = useState(initialRate);
  const [volume, setVolumeState] = useState(initialVolume);

  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    const synth = window.speechSynthesis;

    if (!synth) {
      setIsSupported(false);
      setError('Speech Synthesis API is not supported in this browser');
      return;
    }

    setIsSupported(true);
    synthRef.current = synth;

    return () => {
      if (synth) {
        synth.cancel();
      }
    };
  }, []);

  const speak = useCallback(
    (text: string) => {
      if (!synthRef.current || !isSupported) {
        setError('Speech Synthesis not available');
        return;
      }

      // Cancel any ongoing speech
      synthRef.current.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.language = language;
      utterance.rate = rate;
      utterance.pitch = initialPitch;
      utterance.volume = volume;

      utterance.onstart = () => {
        setIsSpeaking(true);
        setIsPaused(false);
        setError(null);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        setIsPaused(false);
      };

      utterance.onerror = (event) => {
        setError(`Error: ${event.error}`);
        setIsSpeaking(false);
      };

      synthRef.current.speak(utterance);
    },
    [isSupported, language, rate, initialPitch, volume]
  );

  const pause = useCallback(() => {
    if (synthRef.current && isSpeaking) {
      synthRef.current.pause();
      setIsPaused(true);
    }
  }, [isSpeaking]);

  const resume = useCallback(() => {
    if (synthRef.current && isPaused) {
      synthRef.current.resume();
      setIsPaused(false);
    }
  }, [isPaused]);

  const cancel = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
    }
  }, []);

  const setRate = useCallback((newRate: number) => {
    const clampedRate = Math.max(0.5, Math.min(2.0, newRate));
    setRateState(clampedRate);
  }, []);

  const setVolume = useCallback((newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolumeState(clampedVolume);
  }, []);

  return {
    isSupported,
    isSpeaking,
    isPaused,
    speak,
    pause,
    resume,
    cancel,
    setRate,
    setVolume,
    error,
  };
};

export default useSpeechSynthesis;
