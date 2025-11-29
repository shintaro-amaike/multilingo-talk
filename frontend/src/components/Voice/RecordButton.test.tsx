import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../../test/test-utils';
import RecordButton from './RecordButton';

// Mock the hooks
vi.mock('../../hooks/useSpeechRecognition', () => ({
  default: () => ({
    isListening: false,
    isSupported: true,
    transcript: '',
    startListening: vi.fn(),
    stopListening: vi.fn(),
    resetTranscript: vi.fn(),
    error: null,
  }),
}));

vi.mock('../../services/mediaService', () => ({
  default: {
    checkBrowserSupport: () => ({ mediaDevices: true }),
    requestMicrophoneAccess: vi.fn(() => Promise.resolve(new MediaStream())),
    stopMediaStream: vi.fn(),
  },
}));

describe('RecordButton Component', () => {
  const mockOnTranscript = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render record button', () => {
    render(<RecordButton onTranscript={mockOnTranscript} />);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('should display start recording tooltip by default', () => {
    render(<RecordButton onTranscript={mockOnTranscript} />);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('title', 'Start recording');
  });

  it('should be disabled when disabled prop is true', () => {
    render(<RecordButton onTranscript={mockOnTranscript} disabled={true} />);
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('should handle language prop', () => {
    const { rerender } = render(
      <RecordButton onTranscript={mockOnTranscript} language="fr-FR" />
    );
    expect(screen.getByRole('button')).toBeInTheDocument();

    rerender(<RecordButton onTranscript={mockOnTranscript} language="es-ES" />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should show error message when there is an error', async () => {
    const user = userEvent.setup();
    const errorMessage = 'Microphone access denied';

    // Mock with error
    vi.doMock('../../hooks/useSpeechRecognition', () => ({
      default: () => ({
        isListening: false,
        isSupported: true,
        transcript: '',
        startListening: vi.fn(),
        stopListening: vi.fn(),
        resetTranscript: vi.fn(),
        error: errorMessage,
      }),
    }));

    render(<RecordButton onTranscript={mockOnTranscript} />);

    // Error message should be visible
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('should show Mic icon by default', () => {
    render(<RecordButton onTranscript={mockOnTranscript} />);
    // The Mic icon from @mui/icons-material should be rendered
    const button = screen.getByRole('button');
    expect(button.querySelector('svg')).toBeInTheDocument();
  });

  it('should have proper accessibility attributes', () => {
    render(<RecordButton onTranscript={mockOnTranscript} />);
    const button = screen.getByRole('button');

    expect(button).toHaveAttribute('type', 'button');
    expect(button).toHaveClass('MuiIconButton-root');
  });
});
