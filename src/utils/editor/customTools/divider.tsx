import { Divider as DividerComp, ThemeProvider, styled } from '@mui/material';
import { darkTheme, lightTheme } from '../../../styles/themes';

import { DEFAULT_SETTINGS } from '../../constants';
import { PluginThemeProvider } from '../../../ui/components/PluginThemeProvider';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { dividerIcon } from '../../../assets/svgs';


interface ComponentProps { }

let BlockWrapper = styled('div')(({ theme }) => ({
  padding: `16px 0`,
  width: '100%',
  borderRadius: 4,
}));

let StyledDivider = styled(DividerComp)(({ theme }) => ({
  marginLeft: 0,
  marginRight: 0,
  borderWidth: 1,
  borderColor: theme.palette.divider,
  width: '100%',
}));

const InputUI = (blockData: ComponentProps) => {
  return (
    <BlockWrapper>
      <StyledDivider variant="middle" />
    </BlockWrapper>
  );
};

export class Divider {
  data: any;
  readOnly: boolean;

  static get toolbox() {
    return {
      title: 'Divider',
      icon: dividerIcon,
    };
  }

  constructor({ data, readOnly }) {
    this.data = data;
    this.readOnly = readOnly;
  }

  static get isReadOnlySupported() {
    return true;
  }

  render() {
    let ui = document.createElement('div');
    let root = createRoot(ui);
    root.render(
      <PluginThemeProvider>
        <InputUI {...this.data} />
      </PluginThemeProvider>
    );
    ui.classList.add('divider');

    return ui;
  }

  save() {
    return {};
  }
}
