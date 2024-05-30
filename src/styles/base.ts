const BASE_COLOR_PALETTE = {
  primary: '#3F98FC',
  onPrimary: '#FFF',
  secondary: '#D6E9FF',
  onSecondary: '#275488',
  background: { default: '#FFF', tonal_low: '#F4F7F9', tonal_high: '#E3EBF2' },
  onBackground: {
    high: '#22264F',
    mid: '#626582',
    low: '#898C93',
    link: '#2C7CD6',
  },
  surface: '#F0F5F8',
  onSurface: {
    high: '#22264F',
    mid: '#626582',
    low: '#898C93',
  },
  divider: {
    simple: '#BED1E2',
    interactive: '#B9B7B7',
  },
  status: {
    success: {
      muted: '#D0FFCF',
      default: '#ACF4B8',
      content: '#426347',
    },
    warning: {
      muted: '#FFF4CF',
      default: '#F0D796',
      content: '#574D34',
    },
    error: {
      muted: '#FFCFDB',
      default: '#FF5A82',
      content: '#AA5656',
    },
    info: {
      muted: '#CFDDFF',
      default: '#ACC9F4',
      content: '#2E3B6A',
    },
    neutral: {
      muted: '#D5E1EC',
      default: '#BED1E2',
      content: '#1F507B',
    },
  },
};

export type ColorPalette = typeof BASE_COLOR_PALETTE;

export const BASE_STYLE_TOKENS = {
  fontFamily: ['Inter', 'Arial', 'sans-serif'].join(','),
  codeFontFamily: ['Consolas', 'Monaco', 'monospace'].join(','),
  baseFontSize: 12,
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
    u48: 48,
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
