import React from 'react';
import { AppBar, Toolbar, Typography, IconButton, Box } from '@mui/material';
import { Brightness4, Brightness7, Menu } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { toggleDarkMode } from '../../store/settingsSlice';
import type { RootState } from '../../store/store';

interface HeaderProps {
  onMenuClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const dispatch = useDispatch();
  const darkMode = useSelector((state: RootState) => state.settings.settings?.darkMode);

  return (
    <AppBar position="static" sx={{ mb: 3 }}>
      <Toolbar>
        <IconButton
          size="large"
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ mr: 2 }}
          onClick={onMenuClick}
        >
          <Menu />
        </IconButton>

        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h6" component="div">
            MultiLingo Talk
          </Typography>
        </Box>

        <IconButton
          size="large"
          color="inherit"
          onClick={() => dispatch(toggleDarkMode())}
          title="Toggle dark mode"
        >
          {darkMode ? <Brightness7 /> : <Brightness4 />}
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
