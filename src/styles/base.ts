const BASE_COLOR_PALETTE = {
  primary: '#3F98FC',
  onPrimary: '#FFF',
  secondary: '#D6E9FF',
  onSecondary: '#275488',
  background: '#FFF',
  onBackground: {
    high: '#000000',
    mid: '#626262',
    low: '#898C93',
    link: '2C7CD6',
  },
  surface: '#F0F5F8',
  onSurface: {
    high: '#000000',
    mid: '#626262',
    low: '#898C93',
  },
  divider: {
    simple: '#E6E6E6',
    interactive: '#B9B7B7',
  },
  callout: {
    success: '',
    info: '',
    error: '',
    warning: '',
    neutral: '',
  },
  onCallout: '',
  guidelines: {
    do: '',
    dont: '',
  },
  onGuidelines: '',
};

export type ColorPalette = typeof BASE_COLOR_PALETTE;

export const BASE_STYLE_TOKENS = {
  fontFamily: ['Inter', 'Arial', 'sans-serif'].join(','),
  units: {
    u0: 0,
    u1: 1,
    u2: 2,
    u4: 4,
    u6: 6,
    u8: 8,
    u12: 12,
    u14: 14,
    u16: 16,
    u18: 18,
    u20: 20,
    u22: 22,
    u24: 24,
    u28: 28,
    u32: 32,
    u36: 36,
    u42: 42,
    u56: 56,
    u64: 64,
    u96: 96,
  },
  palette: BASE_COLOR_PALETTE,
  opacity: {
    disabled: 0.5,
  },
};

export type BaseStyleTokens = typeof BASE_STYLE_TOKENS;