/**
 * Media Service
 * Handles microphone and audio device access
 */

export interface MediaDeviceInfo {
  id: string;
  label: string;
  kind: 'audioinput' | 'audiooutput';
}

class MediaService {
  /**
   * Request microphone access
   */
  async requestMicrophoneAccess(): Promise<MediaStream> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      return stream;
    } catch (error) {
      if (error instanceof DOMException) {
        switch (error.name) {
          case 'NotAllowedError':
            throw new Error(
              'Microphone permission denied. Please enable microphone access.'
            );
          case 'NotFoundError':
            throw new Error('No microphone found. Please connect a microphone.');
          case 'NotReadableError':
            throw new Error(
              'Microphone is busy. Please close other applications using the microphone.'
            );
          default:
            throw new Error(`Microphone error: ${error.message}`);
        }
      }
      throw error;
    }
  }

  /**
   * Stop media stream
   */
  stopMediaStream(stream: MediaStream): void {
    stream.getTracks().forEach((track) => {
      track.stop();
    });
  }

  /**
   * Get available audio devices
   */
  async getAudioDevices(): Promise<MediaDeviceInfo[]> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices
        .filter((device) => device.kind.includes('audio'))
        .map((device) => ({
          id: device.deviceId,
          label: device.label || `Audio Device ${device.deviceId.slice(0, 5)}`,
          kind: device.kind as 'audioinput' | 'audiooutput',
        }));
    } catch (error) {
      console.error('Error enumerating devices:', error);
      return [];
    }
  }

  /**
   * Check if microphone is available
   */
  async isMicrophoneAvailable(): Promise<boolean> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.some((device) => device.kind === 'audioinput');
    } catch (error) {
      return false;
    }
  }

  /**
   * Check browser support for media APIs
   */
  checkBrowserSupport(): {
    mediaDevices: boolean;
    webAudio: boolean;
    mediaRecorder: boolean;
  } {
    return {
      mediaDevices: !!navigator.mediaDevices?.getUserMedia,
      webAudio: !!(window.AudioContext || (window as any).webkitAudioContext),
      mediaRecorder: !!(window.MediaRecorder),
    };
  }
}

export default new MediaService();
