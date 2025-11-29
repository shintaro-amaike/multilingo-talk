import React, { useEffect, useState } from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  Box,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
} from '@mui/material';
import {
  Cloud as CloudIcon,
  CloudDownload as CloudDownloadIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';

interface Backup {
  filename: string;
  path: string;
  size_bytes: number;
  created_at: string;
}

interface BackupManagerProps {
  className?: string;
}

export const BackupManager: React.FC<BackupManagerProps> = ({ className }) => {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    loadBackups();
  }, []);

  const loadBackups = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/backup/list');
      const data = await response.json();

      if (data.success) {
        setBackups(data.data.backups);
      } else {
        setError('Failed to load backups');
      }
    } catch (err) {
      setError('Failed to load backups. Please check your connection.');
      console.error('Backup load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBackup = async () => {
    try {
      const response = await fetch('/api/backup/create', { method: 'POST' });
      const data = await response.json();

      if (data.success) {
        // Reload backups list
        await loadBackups();
      } else {
        setError('Failed to create backup');
      }
    } catch (err) {
      setError('Failed to create backup');
      console.error('Backup creation error:', err);
    }
  };

  const handleDeleteBackup = async () => {
    if (!deleteConfirm) return;

    try {
      const response = await fetch(`/api/backup/${deleteConfirm}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (data.success) {
        setDeleteConfirm(null);
        await loadBackups();
      } else {
        setError('Failed to delete backup');
      }
    } catch (err) {
      setError('Failed to delete backup');
      console.error('Backup deletion error:', err);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <Card className={className}>
      <CardHeader
        title="💾 Backup Management"
        subtitle="Create and manage database backups"
        avatar={<CloudIcon />}
      />

      <CardContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : backups.length === 0 ? (
          <Alert severity="info">No backups yet. Create your first backup below.</Alert>
        ) : (
          <Box sx={{ overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: 'grey.100' }}>
                  <TableCell>Filename</TableCell>
                  <TableCell align="right">Size</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {backups.map((backup) => (
                  <TableRow key={backup.filename} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CloudIcon fontSize="small" color="primary" />
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                          {backup.filename}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      <Chip
                        label={formatFileSize(backup.size_bytes)}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption">
                        {formatDate(backup.created_at)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        startIcon={<CloudDownloadIcon />}
                        href={`/api/backup/download/${backup.path}`}
                        target="_blank"
                      >
                        Download
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => setDeleteConfirm(backup.filename)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        )}
      </CardContent>

      <CardActions>
        <Button startIcon={<RefreshIcon />} onClick={loadBackups} disabled={loading}>
          Refresh
        </Button>
        <Button
          variant="contained"
          startIcon={<CloudIcon />}
          onClick={handleCreateBackup}
          disabled={loading}
        >
          Create Backup Now
        </Button>
      </CardActions>

      {/* Delete confirmation dialog */}
      <Dialog open={Boolean(deleteConfirm)} onClose={() => setDeleteConfirm(null)}>
        <DialogTitle>Confirm Backup Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the backup "{deleteConfirm}"?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm(null)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteBackup}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default BackupManager;
