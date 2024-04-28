import { DEFAULT_SETTINGS } from '../utils/constants';
import { createTheme } from '@mui/material';

const baseTheme = {
  typography: {
    fontSize: 12,
    fontFamily: ['Inter', 'Arial', 'sans-serif'].join(','),
    h1: { fontWeight: 600, fontSize: 36 },
    h2: { fontWeight: 600, fontSize: 28 },
    h3: { fontWeight: 600, fontSize: 20 },
    h4: { fontWeight: 600, fontSize: 16 },
    h5: { fontWeight: 600, fontSize: 14 },
    h6: { fontWeight: 600, fontSize: 12 },
  },
  spacing: 1,
};

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
  ...baseTheme,
});

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    text: {
      primary: DEFAULT_SETTINGS.palette.heading,
      secondary: DEFAULT_SETTINGS.palette.paragraph,
    },
    background: {
      default: DEFAULT_SETTINGS.palette.background,
      paper: DEFAULT_SETTINGS.palette.surface,
    },
    divider: DEFAULT_SETTINGS.palette.divider,
  },
  ...baseTheme,
});
