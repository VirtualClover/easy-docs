import { Container, styled } from '@mui/material';

import { CustomTheme } from '../../styles/themes';
import zIndex from '@mui/material/styles/zIndex';

interface ContainerProps {
  theme: CustomTheme;
}

export const PluginContainer = styled(Container, {
  name: 'PluginContainer',
  slot: 'root',
})(({ theme }: ContainerProps) => ({
  background: theme.palette.background.default,
  color: theme.palette.text.primary,

  '.MuiButtonBase-root': {
    textTransform: 'none',
  },
  '.MuiButton-outlined': {
    color: theme.palette.text.primary,
    borderColor: theme.palette.text.primary,
  },
  '.MuiIconButton-root': {
    borderRadius: 4,
  },

  '.MuiTabs-flexContainer .MuiTab-root:first-of-type': {
    marginLeft: 16,
  },

  '.MuiTab-root': {
    border: 'none',
    borderRadius: 8,
    margin: '8px 4px',
    padding: '0 8px',
    minHeight: 32,
    minWidth: 32,
  },

  '.MuiTab-root.Mui-selected': {
    color: theme.palette.text.primary,
    background: theme.palette.background.paper,
  },

  '.MuiTabs-indicator': {
    display: 'none',
  },

  'a[href]': {
    color: theme.palette.link,
  },

  '#editorjs': {
    background: theme.palette.background.default,
  },

  'h1, h2, h3, h4, h5, h6': {
    fontWeight: 700,
  },

  a: {
    color: theme.palette.primary.main,
  },

  '.ce-popover--opened': {
    maxHeight: '500px',
  },

  '.codex-editor': {
    zIndex: 1200,
  },

  '.codex-editor .custom-icon path': {
    stroke: 'transparent',
  },

  '.cdx-block': {
    color: theme.palette.text.secondary,

    '& .tc-wrap': {
      '--color-border': theme.palette.divider,
      height: 'auto',
    },

    '& .tc-table--heading .tc-row:first-of-type, .tc-table--heading .tc-row:first-of-type [contenteditable]:empty:before':
      {
        color: theme.palette.text.primary,
      },

    '& .tc-table--heading .tc-row:nth-of-type(odd)': {
      background: theme.palette.background.paper,
    },

    //      color: theme.palette.text.primary
  },
  '& ::selection, .ce-block--selected .cdx-block, .ce-block--selected .ce-block__content, .ce-block--selected .ce-block__content hr, .ce-block--selected .ce-block__content .tc-cell':
    {
      background: '#0338A2',
      color: 'white',
      borderColor: `white`,
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
  '.ce-popover, .ce-conversion-toolbar': {
    background: theme.palette.background.default,
    borderColor: theme.palette.divider,
  },
  '.ce-popover-item, .ce-conversion-tool': {
    background: theme.palette.background.default,
    color: theme.palette.text.primary,
    '&:hover': {
      background: theme.palette.background.paper,
    },
    '&--active': {
      background: theme.palette.background.paper,
    },
  },
  '.ce-popover-item__icon, .ce-conversion-tool__icon': {
    background: theme.palette.background.paper,
    color: theme.palette.text.primary,
    border: `1px solid ${theme.palette.divider}`,
  },

  '.ce-popover-item--confirmation .ce-popover-item__title': {
    color: theme.palette.text.primary,
  },

  '.cdx-list__item': {
    padding: 0,
  },

  '.ce-toolbar__plus, .ce-toolbar__settings-btn': {
    background: theme.palette.background.default,
    color: theme.palette.text.primary,
    border: `1px solid ${theme.palette.divider}`,
    '&:hover': {
      background: theme.palette.background.paper,
    },
  },

  '.cdx-alert': {
    margin: `12px auto`,
  },

  '.cdx-alert-info': {
    background: theme.palette.info.light,
    border: 0,
    borderLeft: `8px solid ${theme.palette.info.main}`,
    color: theme.palette.info.contrastText,
  },
  '.cdx-alert-success': {
    background: theme.palette.success.light,
    border: 0,
    borderLeft: `8px solid ${theme.palette.success.main}`,
    color: theme.palette.success.contrastText,
  },
  '.cdx-alert-warning': {
    background: theme.palette.warning.light,
    border: 0,
    borderLeft: `8px solid ${theme.palette.warning.main}`,
    color: theme.palette.warning.contrastText,
  },
  '.cdx-alert-danger': {
    background: theme.palette.error.light,
    border: 0,
    borderLeft: `8px solid ${theme.palette.error.main}`,
    color: theme.palette.error.contrastText,
  },
  '.ce-code__textarea': {
    color: theme.palette.text.primary,
    background: theme.palette.background.paper,
    border: 'none',
    minHeight: '160px',
  },

  '.ce-conversion-toolbar__label': {
    color: theme.palette.text.secondary,
  },
}));
