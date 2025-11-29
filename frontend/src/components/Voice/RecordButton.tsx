import React, { useState, useRef, useEffect } from 'react';
import { IconButton, CircularProgress, Box, Typography, Tooltip } from '@mui/material';
import { Mic, Stop } from '@mui/icons-material';
import useSpeechRecognition from '../../hooks/useSpeechRecognition';
import { triggerHapticFeedback } from '../../utils/touch';
import mediaService from '../../services/mediaService';

interface RecordButtonProps {
  onTranscript: (text: string) => void;
  language?: string;
  disabled?: boolean;
}

const RecordButton: React.FC<RecordButtonProps> = ({
  onTranscript,
  language = 'en-US',
  disabled = false,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const {
    isListening,
    isSupported,
    transcript,
    startListening,
    stopListening,
    resetTranscript,
    error: speechError,
  } = useSpeechRecognition({
    language,
    continuous: true,
    interimResults: true,
  });

  useEffect(() => {
    if (speechError) {
      setError(speechError);
    }
  }, [speechError]);

  const handleStartRecording = async () => {
    setIsInitializing(true);
    setError(null);
    triggerHapticFeedback('light');

    try {
      // Check browser support
      const support = mediaService.checkBrowserSupport();
      if (!support.mediaDevices) {
        throw new Error('Your browser does not support microphone access');
      }

      // Request microphone access
      mediaStreamRef.current = await mediaService.requestMicrophoneAccess();

      // Reset transcript and start listening
      resetTranscript();
      startListening();
      setIsRecording(true);
      triggerHapticFeedback('success');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      setIsRecording(false);
      triggerHapticFeedback('error');
    } finally {
      setIsInitializing(false);
    }
  };

  const handleStopRecording = () => {
    triggerHapticFeedback('medium');
    stopListening();

    // Stop media stream
    if (mediaStreamRef.current) {
      mediaService.stopMediaStream(mediaStreamRef.current);
      mediaStreamRef.current = null;
    }

    setIsRecording(false);

    // Send transcript to parent component
    if (transcript) {
      onTranscript(transcript);
    }
  };

  const handleToggleRecording = async () => {
    if (isRecording) {
      handleStopRecording();
    } else {
      await handleStartRecording();
    }
  };

  const isDisabled = disabled || isInitializing || !isSupported;
  const showError = error || (!isSupported && 'Speech recognition not supported');

  return (
    <Box>
      <Tooltip title={showError || (isRecording ? 'Stop recording' : 'Start recording')}>
        <span>
          <IconButton
            color={isRecording ? 'error' : 'primary'}
            onClick={handleToggleRecording}
            disabled={isDisabled}
            size="large"
            sx={{
              transition: 'all 0.2s ease',
              '&:active': {
                transform: 'scale(0.95)',
              },
              '@media (max-width: 600px)': {
                padding: '16px',
                fontSize: '1.75rem',
              },
            }}
          >
            {isInitializing ? (
              <CircularProgress size={24} />
            ) : isRecording ? (
              <Stop />
            ) : (
              <Mic />
            )}
          </IconButton>
        </span>
      </Tooltip>

      {showError && (
        <Typography
          variant="caption"
          color="error"
          sx={{ display: 'block', mt: 1 }}
        >
          {showError}
        </Typography>
      )}

      {isRecording && (
        <Typography
          variant="caption"
          color="success"
          sx={{ display: 'block', mt: 1 }}
        >
          ● Recording...
        </Typography>
      )}
    </Box>
  );
};

export default RecordButton;
