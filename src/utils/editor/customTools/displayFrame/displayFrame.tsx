import {
  generateFigmaURL,
  getDetailsFromFigmaURL,
  getEmbedURLFromShare,
  validateFigmaURL,
} from '../../../docs/figmaURLHandlers';

import React from 'react';
import { createRoot } from 'react-dom/client';
import { styled } from '@mui/material';

//https://www.figma.com/file/XUdu09UGUDZUBaEXvkrNnX/Untitled?type=design&node-id=7%3A2206&mode=design&t=fAGyucibEv9Dl8od-1
//`https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Ffile%2F${fileId}%2FUntitled%3Ftype%3Ddesign%26node-id%3D${frameId}

interface ComponentProps {
  frameId: string;
  fileId: string;
  caption: string;
}

const InputUI = (blockData: ComponentProps) => {
  let IFrame = styled('iframe')(({ theme }) => ({
    border: `1px solid ${theme.palette.divider}`,
    width: '100%',
    height: 300,
    borderRadius: 4,
  }));

  let BlockWrapper = styled('div')(({ theme }) => ({
    margin: `${32} ${0}`,
    width: '100%',
    borderRadius: 4,
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  }));

  let [src, setSrc] = React.useState(
    generateFigmaURL(blockData.fileId, blockData.frameId, 'share')
  );

  let [frameDetails, setFrameDetails] = React.useState({
    frameId: blockData.frameId,
    fileId: blockData.fileId,
  });

  return (
    <BlockWrapper>
      <input
        className="cdx-input"
        id="cdx-display-frame-frame-url"
        placeholder={'Add Figma link here!'}
        style={{ flex: 1 }}
        value={src}
        onChange={(e) => {
          setSrc(e.target.value);
          if (validateFigmaURL(e.target.value)) {
            setFrameDetails(getDetailsFromFigmaURL(e.target.value, 'decode'));
          }
        }}
      />
      {validateFigmaURL(src) && (
        <>
          <IFrame
            src={generateFigmaURL(
              frameDetails.fileId,
              frameDetails.frameId,
              'embed'
            )}
          ></IFrame>
          <input
            className="cdx-input"
            id="cdx-display-frame-caption"
            placeholder={'Enter a caption!'}
            defaultValue={blockData.caption}
          />
        </>
      )}
    </BlockWrapper>
  );
};

export class DisplayFrame {
  data: any;

  static get toolbox() {
    return {
      title: 'Figma Frame',
      icon: '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentFill" xmlns="http://www.w3.org/2000/svg"><path d="M9.68318 7.03184H7.72563V3.19995H9.68318C10.7396 3.19995 11.5989 4.05926 11.5989 5.11568C11.5989 6.17211 10.7396 7.03184 9.68318 7.03184ZM8.35326 6.40422H9.68318C10.3936 6.40422 10.9713 5.82608 10.9713 5.11611C10.9713 4.40614 10.3932 3.828 9.68318 3.828H8.35326V6.40422ZM8.35326 7.03184H6.39614C5.33971 7.03184 4.48041 6.17254 4.48041 5.11611C4.48041 4.05968 5.33971 3.19995 6.39614 3.19995H8.35369L8.35326 7.03184ZM6.39614 3.82758C5.68574 3.82758 5.10803 4.40571 5.10803 5.11568C5.10803 5.82566 5.68574 6.40422 6.39614 6.40422H7.72606V3.82758H6.39614ZM8.35326 10.2357H6.39614C5.33971 10.2357 4.48041 9.37638 4.48041 8.31995C4.48041 7.26352 5.33971 6.40422 6.39614 6.40422H8.35326V10.2357ZM6.39614 7.03184C5.68574 7.03184 5.10803 7.60998 5.10803 8.31995C5.10803 9.02992 5.68617 9.60808 6.39614 9.60808H7.72606L7.72563 7.03184H6.39614ZM6.40638 13.44C5.34441 13.44 4.47998 12.5806 4.47998 11.5242C4.47998 10.4678 5.33972 9.60808 6.39614 9.60808L8.35326 9.60846V11.5033C8.35326 12.5713 7.47987 13.44 6.40638 13.44ZM6.39614 10.2357C6.05465 10.2361 5.72728 10.372 5.48581 10.6135C5.24434 10.8549 5.10849 11.1823 5.10803 11.5238C5.10803 12.2342 5.69043 12.8119 6.40681 12.8119C7.13427 12.8119 7.72649 12.2248 7.72649 11.5029V10.2357H6.39614ZM9.68318 10.2357H9.64137C8.58494 10.2357 7.72563 9.37638 7.72563 8.31995C7.72563 7.26352 8.58494 6.40422 9.64137 6.40422H9.68318C10.7396 6.40422 11.5989 7.26352 11.5989 8.31995C11.5989 9.37638 10.7396 10.2357 9.68318 10.2357ZM9.64179 7.03184C8.93139 7.03184 8.35369 7.60998 8.35369 8.31995C8.35369 9.02992 8.93182 9.60808 9.64179 9.60808H9.68361C10.394 9.60808 10.9717 9.02992 10.9717 8.31995C10.9717 7.60998 10.3932 7.03184 9.68318 7.03184H9.64179Z"/></svg>',
    };
  }

  constructor({ data }) {
    this.data = data;
  }

  render() {
    let ui = document.createElement('div');
    let root = createRoot(ui);
    root.render(<InputUI {...this.data} />);
    ui.classList.add('display-frame');

    return ui;
  }

  save(blockContent) {
    let caption;
    let frameUrl;
    if (blockContent.querySelector('#cdx-display-frame-frame-url')) {
      frameUrl = blockContent.querySelector(
        '#cdx-display-frame-frame-url'
      ).value;
    }
    if (blockContent.querySelector('#cdx-display-frame-caption')) {
      caption = blockContent.querySelector('#cdx-display-frame-caption').value;
    }

    return {
      ...getDetailsFromFigmaURL(frameUrl, 'decode'),
      caption,
    };
  }

  validate(savedData) {
    if (!savedData.fileId || !savedData.frameId) {
      console.log('Not validated');
      return false;
    }

    return true;
  }
}
