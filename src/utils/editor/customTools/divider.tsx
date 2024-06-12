import { Divider as DividerComp, styled } from '@mui/material';

import { DEFAULT_SETTINGS } from '../../constants';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { dividerIcon } from '../../../assets/svgs';

//https://www.figma.com/file/XUdu09UGUDZUBaEXvkrNnX/Untitled?type=design&node-id=7%3A2206&mode=design&t=fAGyucibEv9Dl8od-1
//`https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Ffile%2F${fileId}%2FUntitled%3Ftype%3Ddesign%26node-id%3D${frameId}

interface ComponentProps {}

let BlockWrapper = styled('div')(({ theme }) => ({
  margin: `${32} ${0}`,
  width: '100%',
  borderRadius: 4,
}));

const InputUI = (blockData: ComponentProps) => {
  return (
    <BlockWrapper>
      <DividerComp variant="middle" />
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
    let ui = document.createElement('div');
    let root = createRoot(ui);
    root.render(<InputUI {...this.data} />);
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
