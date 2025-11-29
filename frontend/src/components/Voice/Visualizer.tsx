import React, { useEffect, useRef } from 'react';
import { Box } from '@mui/material';

interface VisualizerProps {
  isActive?: boolean;
  width?: number;
  height?: number;
  color?: string;
  backgroundColor?: string;
}

const Visualizer: React.FC<VisualizerProps> = ({
  isActive = false,
  width = 300,
  height = 100,
  color = '#1976d2',
  backgroundColor = 'transparent',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationIdRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);

  useEffect(() => {
    if (!isActive) {
      if (animationIdRef.current !== null) {
        cancelAnimationFrame(animationIdRef.current);
      }
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Initialize audio context
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
    }

    // Get user media
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        if (!audioContextRef.current) return;

        const source = audioContextRef.current.createMediaStreamSource(stream);

        // Create analyser
        const analyser = audioContextRef.current.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);

        analyserRef.current = analyser;
        dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);

        // Draw function
        const draw = () => {
          if (!analyserRef.current || !dataArrayRef.current || !ctx) return;

          animationIdRef.current = requestAnimationFrame(draw);

          // Get frequency data
          analyserRef.current.getByteFrequencyData(dataArrayRef.current);

          // Clear canvas
          ctx.fillStyle = backgroundColor;
          ctx.fillRect(0, 0, width, height);

          // Draw bars
          const barWidth = width / dataArrayRef.current.length;
          const barGap = 2;

          for (let i = 0; i < dataArrayRef.current.length; i++) {
            const barHeight = (dataArrayRef.current[i] / 255) * height;

            ctx.fillStyle = color;
            ctx.fillRect(
              i * barWidth,
              height - barHeight,
              barWidth - barGap,
              barHeight
            );
          }
        };

        draw();
      })
      .catch((err) => {
        console.error('Error accessing microphone:', err);
      });

    return () => {
      if (animationIdRef.current !== null) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, [isActive, width, height, color, backgroundColor]);

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        my: 2,
      }}
    >
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{
          border: `1px solid ${color}`,
          borderRadius: '4px',
          backgroundColor,
        }}
      />
    </Box>
  );
};

export default Visualizer;
