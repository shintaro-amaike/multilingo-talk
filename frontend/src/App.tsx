import React, { useState, useMemo, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box, CircularProgress } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from './store/store';
import { createAppTheme } from './theme/theme';
import { toggleDarkMode } from './store/settingsSlice';
import useSystemTheme from './hooks/useSystemTheme';

// Pages with code splitting for better performance
const Home = lazy(() => import('./pages/Home'));
const Chat = lazy(() => import('./pages/Chat'));
const Settings = lazy(() => import('./pages/Settings'));
const Analytics = lazy(() => import('./pages/Analytics'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Components
import Header from './components/Common/Header';
import Footer from './components/Common/Footer';
import Sidebar from './components/Common/Sidebar';

// Loading component for lazy loaded routes
const LoadingFallback = () => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '300px',
    }}
  >
    <CircularProgress />
  </Box>
);

const App: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const dispatch = useDispatch();
  const darkMode = useSelector((state: RootState) => state.settings.settings?.darkMode);
  const { prefersDarkMode } = useSystemTheme();

  // Apply system theme preference on first load if darkMode is not explicitly set
  useEffect(() => {
    const isDarkModeSet = localStorage.getItem('darkMode') !== null;
    if (!isDarkModeSet && darkMode !== prefersDarkMode) {
      // System preference detected and no user preference stored
      dispatch(toggleDarkMode());
    }
  }, []);

  // Use optimized theme configuration
  const theme = useMemo(
    () => createAppTheme(darkMode ? 'dark' : 'light'),
    [darkMode]
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100vh',
          }}
        >
          <Header 
            onMenuClick={() => setSidebarOpen(true)}
            sx={{
              // Responsive header
              '@media (max-width:600px)': {
                padding: '12px',
              },
            }}
          />
          <Sidebar 
            open={sidebarOpen} 
            onClose={() => setSidebarOpen(false)}
            // Responsive drawer
            slotProps={{
              backdrop: {
                sx: {
                  '@media (min-width:960px)': {
                    display: 'none',
                  },
                },
              },
            }}
          />

          <Box
            sx={{
              flexGrow: 1,
              // Responsive main content
              '@media (max-width:600px)': {
                padding: '0px',
              },
            }}
          >
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </Box>

          <Footer 
            sx={{
              // Responsive footer
              '@media (max-width:600px)': {
                padding: '16px 12px',
              },
            }}
          />
        </Box>
      </Router>
    </ThemeProvider>
  );
};

export default App;
