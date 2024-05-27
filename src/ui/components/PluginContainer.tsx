import { Container, styled } from '@mui/material';

export const PluginContainer = styled(Container, {
  name: 'PluginContainer',
  slot: 'root',
})(({ theme }) => ({
  background: theme.palette.background.default,
  color: theme.palette.text.primary,
  '#editorjs': {
    background: theme.palette.background.default,
  },

  'h1, h2, h3, h4, h5, h6': {
    fontWeight: 700,
  },

  '.ce-popover--opened': {
    maxHeight: '500px',
  },

  '.codex-editor': {
    zIndex: 1200,
  },

  '.cdx-block': {
    color: theme.palette.text.secondary,
  },
  '.cdx-block, .ce-header': {
    '&::selection': {
      background: theme.palette.info.main,
      color: theme.palette.info.contrastText,
    },
  },
  '.ce-inline-toolbar': {
    background: theme.palette.background.default,
    color: theme.palette.text.primary,
    border: `1px solid ${theme.palette.divider}`,
  },

  '.ce-inline-tool, .ce-inline-toolbar__dropdown': {
    '&:hover': {
      background: theme.palette.background.paper,
    },
  },
  '.ce-popover': {
    background: theme.palette.background.default,
    borderColor: theme.palette.divider,
  },
  '.ce-popover-item': {
    background: theme.palette.background.default,
    color: theme.palette.text.primary,
    '&:hover': {
      background: theme.palette.background.paper,
    },
    '&--active': {
      background: theme.palette.background.paper,
    },
  },
  '.ce-popover-item__icon': {
    background: theme.palette.background.paper,
    color: theme.palette.text.primary,
    border: `1px solid ${theme.palette.divider}`,
  },

  '.ce-popover-item--confirmation .ce-popover-item__title': {
    color: theme.palette.text.primary,
  },

  '.ce-toolbar__plus, .ce-toolbar__settings-btn': {
    background: theme.palette.background.default,
    color: theme.palette.text.primary,
    border: `1px solid ${theme.palette.divider}`,
    '&:hover': {
      background: theme.palette.background.paper,
    },
  },
}));
