import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Settings } from '../types';

interface SettingsState {
  settings: Settings | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: SettingsState = {
  settings: {
    userId: '',
    darkMode: false,
    soundEnabled: true,
    autoTranslate: true,
    playbackSpeed: 1.0,
    volume: 100,
  },
  isLoading: false,
  error: null,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setSettings: (state, action: PayloadAction<Settings>) => {
      state.settings = action.payload;
    },
    updateSettings: (state, action: PayloadAction<Partial<Settings>>) => {
      if (state.settings) {
        state.settings = { ...state.settings, ...action.payload };
      }
    },
    toggleDarkMode: (state) => {
      if (state.settings) {
        state.settings.darkMode = !state.settings.darkMode;
      }
    },
    toggleSound: (state) => {
      if (state.settings) {
        state.settings.soundEnabled = !state.settings.soundEnabled;
      }
    },
    toggleAutoTranslate: (state) => {
      if (state.settings) {
        state.settings.autoTranslate = !state.settings.autoTranslate;
      }
    },
    setPlaybackSpeed: (state, action: PayloadAction<number>) => {
      if (state.settings) {
        state.settings.playbackSpeed = Math.max(0.5, Math.min(2.0, action.payload));
      }
    },
    setVolume: (state, action: PayloadAction<number>) => {
      if (state.settings) {
        state.settings.volume = Math.max(0, Math.min(100, action.payload));
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setSettings,
  updateSettings,
  toggleDarkMode,
  toggleSound,
  toggleAutoTranslate,
  setPlaybackSpeed,
  setVolume,
  setLoading,
  setError,
} = settingsSlice.actions;

export default settingsSlice.reducer;
