import { Palette, PaletteOptions, Theme, createTheme } from '@mui/material';

import { BASE_STYLE_TOKENS } from './base';

interface CustomPaletteOptions extends PaletteOptions {
  link: string;
  component: {
    muted: string;
    default: string;
    content: string;
  };
}

export interface CustomPalette extends Palette {
  link: string;
  component: {
    muted: string;
    default: string;
    content: string;
  };
}

export interface CustomTheme extends Theme {
  palette: CustomPalette;
}

const baseTheme = {
  typography: {
    fontSize: BASE_STYLE_TOKENS.baseFontSize,
    fontFamily: BASE_STYLE_TOKENS.fontFamily,
    h1: { fontWeight: 700, fontSize: 36 },
    h2: { fontWeight: 700, fontSize: 28 },
    h3: { fontWeight: 700, fontSize: 20 },
    h4: { fontWeight: 700, fontSize: 16 },
    h5: { fontWeight: 700, fontSize: 14 },
    h6: { fontWeight: 700, fontSize: 12 },
  },
  spacing: BASE_STYLE_TOKENS.units.u1,
};

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: BASE_STYLE_TOKENS.palette_dark.primary,
      contrastText: BASE_STYLE_TOKENS.palette_dark.onPrimary,
    },
    component: BASE_STYLE_TOKENS.palette_dark.component,
    link: BASE_STYLE_TOKENS.palette_dark.primary,
    text: {
      primary: BASE_STYLE_TOKENS.palette_dark.onBackground.high,
      secondary: BASE_STYLE_TOKENS.palette_dark.onBackground.mid,
    },
    background: {
      default: BASE_STYLE_TOKENS.palette_dark.background.default,
      paper: BASE_STYLE_TOKENS.palette_dark.surface,
    },
    divider: BASE_STYLE_TOKENS.palette_dark.divider.simple,
    success: {
      light: BASE_STYLE_TOKENS.palette_dark.status.success.muted,
      main: BASE_STYLE_TOKENS.palette_dark.status.success.default,
      contrastText: BASE_STYLE_TOKENS.palette_dark.status.success.content,
    },
    info: {
      light: BASE_STYLE_TOKENS.palette_dark.status.info.muted,
      main: BASE_STYLE_TOKENS.palette_dark.status.info.default,
      contrastText: BASE_STYLE_TOKENS.palette_dark.status.info.content,
    },
    warning: {
      light: BASE_STYLE_TOKENS.palette_dark.status.warning.muted,
      main: BASE_STYLE_TOKENS.palette_dark.status.warning.default,
      contrastText: BASE_STYLE_TOKENS.palette_dark.status.warning.content,
    },
    error: {
      light: BASE_STYLE_TOKENS.palette_dark.status.error.muted,
      main: BASE_STYLE_TOKENS.palette_dark.status.error.default,
      contrastText: BASE_STYLE_TOKENS.palette_dark.status.error.content,
    },
  } as CustomPaletteOptions,
  ...baseTheme,
});

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: BASE_STYLE_TOKENS.palette.primary,
      contrastText: BASE_STYLE_TOKENS.palette.onPrimary,
    },
    component: BASE_STYLE_TOKENS.palette.component,
    link: BASE_STYLE_TOKENS.palette.primary,
    text: {
      primary: BASE_STYLE_TOKENS.palette.onBackground.high,
      secondary: BASE_STYLE_TOKENS.palette.onBackground.mid,
    },
    background: {
      default: BASE_STYLE_TOKENS.palette.background.default,
      paper: BASE_STYLE_TOKENS.palette.surface,
    },
    divider: BASE_STYLE_TOKENS.palette.divider.simple,
    success: {
      light: BASE_STYLE_TOKENS.palette.status.success.muted,
      main: BASE_STYLE_TOKENS.palette.status.success.default,
      contrastText: BASE_STYLE_TOKENS.palette.status.success.content,
    },
    info: {
      light: BASE_STYLE_TOKENS.palette.status.info.muted,
      main: BASE_STYLE_TOKENS.palette.status.info.default,
      contrastText: BASE_STYLE_TOKENS.palette.status.info.content,
    },
    warning: {
      light: BASE_STYLE_TOKENS.palette.status.warning.muted,
      main: BASE_STYLE_TOKENS.palette.status.warning.default,
      contrastText: BASE_STYLE_TOKENS.palette.status.warning.content,
    },
    error: {
      light: BASE_STYLE_TOKENS.palette.status.error.muted,
      main: BASE_STYLE_TOKENS.palette.status.error.default,
      contrastText: BASE_STYLE_TOKENS.palette.status.error.content,
    },
  } as CustomPaletteOptions,
  ...baseTheme,
});
