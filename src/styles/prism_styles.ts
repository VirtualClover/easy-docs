import { Box, styled } from '@mui/material';

import { BASE_STYLE_TOKENS } from './base';

export const PrimsWrapper = styled(Box)(({ theme }) => ({
  "code[class*='language-'], pre[class*='language-']": {
    color: theme.palette.grey[50],
    background: '0 0',
    textShadow: '0 1px rgba(0, 0, 0, 0.3)',
    fontFamily: BASE_STYLE_TOKENS.codeFontFamily,
    fontSize: BASE_STYLE_TOKENS.baseFontSize,
    textAlign: 'left',
    whiteSpace: 'pre',
    wordSpacing: 'normal',
    wordBreak: 'normal',
    wordWrap: 'normal',
    lineHeight: 1.5,
    tabSize: 4,
    hyphens: 'none',
  },
  "pre[class*='language-']": {
    padding: '1em',
    margin: `0.5em 0`,
    overflow: 'auto',
    borderRadius: BASE_STYLE_TOKENS.units.u4,
    maxHeight: 225,
  },
  ":not(pre) > code[class*='language-'], pre[class*='language-']": {
    background: theme.palette.grey[900],
  },

  ":not(pre) > code[class*='language-']": {
    padding: '0.1em',
    borderRadius: '0.3em',
    whiteSpace: 'normal',
  },
  '.token.cdata, .token.comment, .token.doctype, .token.prolog': {
    color: '#8292a2',
  },
  '.token.punctuation': {
    color: '#f8f8f2',
  },
  '.token.namespace': {
    opacity: '0.7',
  },
  '.token.constant, .token.deleted, .token.property, .token.symbol, .token.tag':
    {
      color: '#f92672',
    },
  '.token.boolean, .token.number': {
    color: '#ae81ff',
  },
  '.token.attr-name, .token.builtin, .token.char, .token.inserted, .token.selector, .token.string':
    {
      color: '#a6e22e',
    },
  '.language-css .token.string, .style .token.string, .token.entity, .token.operator, .token.url, .token.variable':
    {
      color: '#f8f8f2',
    },
  '.token.atrule, .token.attr-value, .token.class-name, .token.function': {
    color: '#e6db74',
  },
  '.token.keyword': {
    color: '#66d9ef',
  },
  '.token.important, .token.regex': {
    color: '#fd971f',
  },
  '.token.bold, .token.important': {
    fontWeight: 700,
  },
  '.token.italic': {
    fontStyle: 'italic',
  },
  '.token.entity': {
    cursor: 'help',
  },
}));
