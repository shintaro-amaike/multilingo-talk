import React, { useRef, useState, useEffect } from 'react';
import {
  Box,
  IconButton,
  Slider,
  Typography,
  Card,
  CardContent,
} from '@mui/material';
import { PlayArrow, Pause, Stop, VolumeUp } from '@mui/icons-material';

interface AudioPlayerProps {
  audioUrl: string;
  onPlayStart?: () => void;
  onPlayEnd?: () => void;
  title?: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({
  audioUrl,
  onPlayStart,
  onPlayEnd,
  title = 'Audio Player',
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handlePlay = () => {
      setIsPlaying(true);
      onPlayStart?.();
    };
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      setIsPlaying(false);
      onPlayEnd?.();
    };
    const handleError = () => {
      setError('Error loading audio');
      setIsPlaying(false);
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [onPlayStart, onPlayEnd]);

  const handlePlay = () => {
    if (audioRef.current) {
      audioRef.current.play();
    }
  };

  const handlePause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const handleSeek = (value: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value;
    }
  };

  const handleVolumeChange = (value: number) => {
    setVolume(value);
    if (audioRef.current) {
      audioRef.current.volume = value / 100;
    }
  };

  const formatTime = (time: number) => {
    if (!time || !Number.isFinite(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!audioUrl) {
    return <Typography variant="body2">No audio to play</Typography>;
  }

  return (
    <Card sx={{ my: 2 }}>
      <CardContent>
        <Typography variant="subtitle2" gutterBottom>
          {title}
        </Typography>

        <audio ref={audioRef} src={audioUrl} />

        {/* Play/Pause/Stop Controls */}
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <IconButton
            color="primary"
            onClick={isPlaying ? handlePause : handlePlay}
            title={isPlaying ? 'Pause' : 'Play'}
            size="small"
          >
            {isPlaying ? <Pause /> : <PlayArrow />}
          </IconButton>

          <IconButton
            onClick={handleStop}
            title="Stop"
            size="small"
          >
            <Stop />
          </IconButton>

          {isPlaying && (
            <Typography variant="caption" sx={{ alignSelf: 'center' }}>
              Playing...
            </Typography>
          )}
        </Box>

        {error && (
          <Typography color="error" variant="caption" sx={{ display: 'block', mb: 2 }}>
            {error}
          </Typography>
        )}

        {/* Progress Slider */}
        <Box sx={{ mb: 2 }}>
          <Slider
            min={0}
            max={duration || 0}
            value={currentTime}
            onChange={(e, value) => handleSeek(value as number)}
            size="small"
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="caption">
              {formatTime(currentTime)}
            </Typography>
            <Typography variant="caption">
              {formatTime(duration)}
            </Typography>
          </Box>
        </Box>

        {/* Volume Control */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <VolumeUp fontSize="small" />
          <Slider
            min={0}
            max={100}
            step={5}
            value={volume}
            onChange={(e, value) => handleVolumeChange(value as number)}
            sx={{ flex: 1 }}
            size="small"
          />
          <Typography variant="caption" sx={{ minWidth: '35px' }}>
            {volume}%
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default AudioPlayer;
