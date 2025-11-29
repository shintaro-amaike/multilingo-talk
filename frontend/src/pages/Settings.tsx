import React, { useState } from 'react';
import {
  Container,
  Box,
  Card,
  CardContent,
  Typography,
  Switch,
  FormControlLabel,
  Slider,
  Button,
  Divider,
  Tabs,
  Tab,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import {
  toggleDarkMode,
  toggleSound,
  toggleAutoTranslate,
  setPlaybackSpeed,
  setVolume,
} from '../store/settingsSlice';
import { ExportDialog, BackupManager } from '../components/Data';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const Settings: React.FC = () => {
  const dispatch = useDispatch();
  const settings = useSelector((state: RootState) => state.settings.settings);
  const [tabValue, setTabValue] = useState(0);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  if (!settings) {
    return <Typography>Loading settings...</Typography>;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom sx={{ mb: 2 }}>
        ⚙️ Settings
      </Typography>

      <Tabs
        value={tabValue}
        onChange={(e, newValue) => setTabValue(newValue)}
        sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab label="General" id="settings-tab-0" aria-controls="settings-tabpanel-0" />
        <Tab label="Audio" id="settings-tab-1" aria-controls="settings-tabpanel-1" />
        <Tab label="Learning" id="settings-tab-2" aria-controls="settings-tabpanel-2" />
        <Tab label="Data & Backup" id="settings-tab-3" aria-controls="settings-tabpanel-3" />
      </Tabs>

      {/* General Tab */}
      <TabPanel value={tabValue} index={0}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Display
            </Typography>
            <Divider sx={{ my: 2 }} />

            <FormControlLabel
              control={
                <Switch
                  checked={settings.darkMode}
                  onChange={() => dispatch(toggleDarkMode())}
                />
              }
              label="Dark Mode"
            />

            <Box sx={{ mt: 3 }}>
              <Typography variant="body2" color="textSecondary">
                Customize the appearance of your learning interface
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Audio Tab */}
      <TabPanel value={tabValue} index={1}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Audio Settings
            </Typography>
            <Divider sx={{ my: 2 }} />

            <FormControlLabel
              control={
                <Switch
                  checked={settings.soundEnabled}
                  onChange={() => dispatch(toggleSound())}
                />
              }
              label="Sound Effects"
            />

            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Volume: {settings.volume}%
              </Typography>
              <Slider
                value={settings.volume}
                onChange={(e, value) => dispatch(setVolume(value as number))}
                min={0}
                max={100}
                step={5}
              />
            </Box>

            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Playback Speed: {settings.playbackSpeed.toFixed(1)}x
              </Typography>
              <Slider
                value={settings.playbackSpeed}
                onChange={(e, value) => dispatch(setPlaybackSpeed(value as number))}
                min={0.5}
                max={2.0}
                step={0.1}
                marks={[
                  { value: 0.5, label: '0.5x' },
                  { value: 1.0, label: '1x' },
                  { value: 1.5, label: '1.5x' },
                  { value: 2.0, label: '2x' },
                ]}
              />
            </Box>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Learning Tab */}
      <TabPanel value={tabValue} index={2}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Learning Preferences
            </Typography>
            <Divider sx={{ my: 2 }} />

            <FormControlLabel
              control={
                <Switch
                  checked={settings.autoTranslate}
                  onChange={() => dispatch(toggleAutoTranslate())}
                />
              }
              label="Auto Translate to Native Language"
            />

            <Box sx={{ mt: 3 }}>
              <Typography variant="body2" color="textSecondary">
                When enabled, AI responses will be automatically translated to your native language
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </TabPanel>

      {/* Data & Backup Tab */}
      <TabPanel value={tabValue} index={3}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <BackupManager />

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📥 Export Your Data
              </Typography>
              <Divider sx={{ my: 2 }} />

              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                Export all your learning conversations and data in JSON or CSV format. This is useful
                for analysis, archiving, or transferring your data to another platform.
              </Typography>

              <Button
                variant="contained"
                onClick={() => setExportDialogOpen(true)}
              >
                Export Data
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🗑️ Account Management
              </Typography>
              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
                <Button variant="outlined">Change Password</Button>
                <Button variant="outlined" color="error">
                  Delete Account
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </TabPanel>

      <ExportDialog
        open={exportDialogOpen}
        onClose={() => setExportDialogOpen(false)}
      />
    </Container>
  );
};

export default Settings;
