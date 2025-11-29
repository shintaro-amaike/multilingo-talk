import React, { useRef, useState, useEffect } from 'react';
import {
  Box,
  IconButton,
  Slider,
  Typography,
  Card,
  CardContent,
} from '@mui/material';
import { PlayArrow, Pause, VolumeUp } from '@mui/icons-material';
import useSpeechSynthesis from '../../hooks/useSpeechSynthesis';

interface PlaybackControlProps {
  text: string;
  language?: string;
  onPlayStart?: () => void;
  onPlayEnd?: () => void;
}

const PlaybackControl: React.FC<PlaybackControlProps> = ({
  text,
  language = 'en-US',
  onPlayStart,
  onPlayEnd,
}) => {
  const [currentRate, setCurrentRate] = useState(1);
  const [currentVolume, setCurrentVolume] = useState(100);

  const {
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
  } = useSpeechSynthesis({
    language,
    rate: currentRate,
    volume: currentVolume / 100,
  });

  const handlePlay = () => {
    if (isSpeaking) {
      if (isPaused) {
        resume();
      }
    } else {
      onPlayStart?.();
      speak(text);
    }
  };

  const handlePause = () => {
    if (isSpeaking && !isPaused) {
      pause();
    } else if (isPaused) {
      resume();
    }
  };

  const handleStop = () => {
    cancel();
    onPlayEnd?.();
  };

  const handleRateChange = (value: number) => {
    setCurrentRate(value);
    setRate(value);
  };

  const handleVolumeChange = (value: number) => {
    setCurrentVolume(value);
    setVolume(value / 100);
  };

  if (!isSupported) {
    return (
      <Typography color="error" variant="body2">
        Speech synthesis is not supported in your browser
      </Typography>
    );
  }

  return (
    <Card sx={{ my: 2 }}>
      <CardContent>
        <Typography variant="subtitle2" gutterBottom>
          Playback Controls
        </Typography>

        {/* Play/Pause/Stop Controls */}
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <IconButton
            color={isSpeaking ? 'error' : 'primary'}
            onClick={isSpeaking ? handleStop : handlePlay}
            title={isSpeaking ? 'Stop' : 'Play'}
            size="small"
          >
            {isSpeaking ? <Pause /> : <PlayArrow />}
          </IconButton>

          {isSpeaking && (
            <Typography variant="caption" sx={{ alignSelf: 'center' }}>
              {isPaused ? 'Paused' : 'Playing...'}
            </Typography>
          )}
        </Box>

        {error && (
          <Typography color="error" variant="caption" sx={{ display: 'block', mb: 2 }}>
            {error}
          </Typography>
        )}

        {/* Speed Control */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="caption">Speed</Typography>
            <Typography variant="caption">{currentRate.toFixed(1)}x</Typography>
          </Box>
          <Slider
            min={0.5}
            max={2.0}
            step={0.1}
            value={currentRate}
            onChange={(e, value) => handleRateChange(value as number)}
            marks={[
              { value: 0.5, label: '0.5x' },
              { value: 1, label: '1x' },
              { value: 1.5, label: '1.5x' },
              { value: 2, label: '2x' },
            ]}
            size="small"
          />
        </Box>

        {/* Volume Control */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <VolumeUp fontSize="small" />
          <Slider
            min={0}
            max={100}
            step={5}
            value={currentVolume}
            onChange={(e, value) => handleVolumeChange(value as number)}
            sx={{ flex: 1 }}
            size="small"
          />
          <Typography variant="caption" sx={{ minWidth: '35px' }}>
            {currentVolume}%
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default PlaybackControl;
