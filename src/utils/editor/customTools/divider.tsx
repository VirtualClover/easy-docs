import { Divider as DividerComp, ThemeProvider, styled } from '@mui/material';
import { darkTheme, lightTheme } from '../../../styles/themes';

import { DEFAULT_SETTINGS } from '../../constants';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { dividerIcon } from '../../../assets/svgs';

//https://www.figma.com/file/XUdu09UGUDZUBaEXvkrNnX/Untitled?type=design&node-id=7%3A2206&mode=design&t=fAGyucibEv9Dl8od-1
//`https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Ffile%2F${fileId}%2FUntitled%3Ftype%3Ddesign%26node-id%3D${frameId}

interface ComponentProps {}

let BlockWrapper = styled('div')(({ theme }) => ({
  padding: `16px 0 32px 0`,
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

  static get toolbox() {
    return {
      title: 'Divider',
      icon: dividerIcon,
    };
  }

  constructor({ data }) {
    this.data = data;
    //console.log(data);
  }

  render() {
    const themeMode = document.documentElement.className;
    let ui = document.createElement('div');
    let root = createRoot(ui);
    root.render(
      <ThemeProvider theme={themeMode == 'figma-dark' ? darkTheme : lightTheme}>
        <InputUI {...this.data} />
      </ThemeProvider>
    );
    //console.log('render');
    ui.classList.add('divider');

    return ui;
  }

  save() {
    //console.log('frame ei¿xists');
    //console.log(this.data.frameExistsInFile);
    return {};
  }
}
