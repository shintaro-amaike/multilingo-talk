import React, { useState, useMemo, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box, CircularProgress } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from './store/store';
import { createAppTheme } from './theme/theme';
import { toggleDarkMode } from './store/settingsSlice';
import useSystemTheme from './hooks/useSystemTheme';

import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Register from './pages/Register';

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

  useEffect(() => {
    const isDarkModeSet = localStorage.getItem('darkMode') !== null;
    if (!isDarkModeSet && darkMode !== prefersDarkMode) {
      dispatch(toggleDarkMode());
    }
  }, []);

  const theme = useMemo(
    () => createAppTheme(darkMode ? 'dark' : 'light'),
    [darkMode]
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
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
                '@media (max-width:600px)': {
                  padding: '12px',
                },
              }}
            />
            <Sidebar
              open={sidebarOpen}
              onClose={() => setSidebarOpen(false)}
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
                '@media (max-width:600px)': {
                  padding: '0px',
                },
              }}
            >
              <Suspense fallback={<LoadingFallback />}>
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/" element={<Home />} />

                  {/* Protected Routes */}
                  <Route element={<PrivateRoute />}>
                    <Route path="/chat" element={<Chat />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/analytics" element={<Analytics />} />
                  </Route>

                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </Box>

            <Footer
              sx={{
                '@media (max-width:600px)': {
                  padding: '16px 12px',
                },
              }}
            />
          </Box>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
