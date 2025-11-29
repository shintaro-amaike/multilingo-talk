import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  FormLabel,
  FormControlLabel,
  Radio,
  RadioGroup,
  CircularProgress,
  Alert,
  Box,
  Typography,
  Divider,
} from '@mui/material';
import { Download as DownloadIcon, Close as CloseIcon } from '@mui/icons-material';

interface ExportDialogProps {
  open: boolean;
  onClose: () => void;
  onExport?: (format: 'json' | 'csv') => void;
}

export const ExportDialog: React.FC<ExportDialogProps> = ({ open, onClose, onExport }) => {
  const [format, setFormat] = useState<'json' | 'csv'>('json');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Call the export API
      const endpoint =
        format === 'json'
          ? '/api/backup/export/json'
          : '/api/backup/export/csv';

      const response = await fetch(endpoint);
      const data = await response.json();

      if (data.success) {
        setSuccess(true);

        // Auto-download the file (in production)
        if (onExport) {
          onExport(format);
        }

        // Close dialog after 2 seconds
        setTimeout(() => {
          onClose();
          setSuccess(false);
        }, 2000);
      } else {
        setError('Export failed. Please try again.');
      }
    } catch (err) {
      setError('Failed to export data. Please check your connection.');
      console.error('Export error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">📥 Export Learning Data</Typography>
        <Button size="small" onClick={onClose} disabled={loading}>
          <CloseIcon />
        </Button>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ py: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Choose the format you'd like to export your learning data in:
          </Typography>
        </Box>

        <FormControl component="fieldset" fullWidth sx={{ mb: 3 }}>
          <FormLabel component="legend" sx={{ mb: 2 }}>
            Export Format
          </FormLabel>
          <RadioGroup
            value={format}
            onChange={(e) => setFormat(e.target.value as 'json' | 'csv')}
            disabled={loading}
          >
            <FormControlLabel
              value="json"
              control={<Radio />}
              label={
                <Box>
                  <Typography variant="subtitle2">JSON</Typography>
                  <Typography variant="caption" color="textSecondary">
                    Structured format with all conversation history and metadata
                  </Typography>
                </Box>
              }
              sx={{ mb: 2 }}
            />

            <FormControlLabel
              value="csv"
              control={<Radio />}
              label={
                <Box>
                  <Typography variant="subtitle2">CSV</Typography>
                  <Typography variant="caption" color="textSecondary">
                    Spreadsheet format with messages and conversation details
                  </Typography>
                </Box>
              }
            />
          </RadioGroup>
        </FormControl>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            What's included:
          </Typography>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            <li>
              <Typography variant="caption">All your conversations</Typography>
            </li>
            <li>
              <Typography variant="caption">Messages and AI responses</Typography>
            </li>
            <li>
              <Typography variant="caption">Topics and difficulty levels</Typography>
            </li>
            <li>
              <Typography variant="caption">Translations and metadata</Typography>
            </li>
          </ul>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            ✓ Export completed successfully! Your file is ready to download.
          </Alert>
        )}
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleExport}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : <DownloadIcon />}
        >
          {loading ? 'Exporting...' : 'Export'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExportDialog;
