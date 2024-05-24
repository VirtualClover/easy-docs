import { Alert, styled } from '@mui/material';
import {
  generateFigmaURL,
  getDetailsFromFigmaURL,
  validateFigmaURL,
} from '../../general/urlHandlers';

import React from 'react';
import { createRoot } from 'react-dom/client';

//https://www.figma.com/file/XUdu09UGUDZUBaEXvkrNnX/Untitled?type=design&node-id=7%3A2206&mode=design&t=fAGyucibEv9Dl8od-1
//`https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Ffile%2F${fileId}%2FUntitled%3Ftype%3Ddesign%26node-id%3D${frameId}

interface ComponentProps {
  frameId: string;
  fileId: string;
  frameExistsInFile: boolean;
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

  let [frameExistsInFile, setFrameExistsInFile] = React.useState(
    blockData.frameExistsInFile
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
          {typeof frameExistsInFile != 'undefined' && !frameExistsInFile && (
            <Alert severity="error">
              The frame referenced in this block was possibly deleted.
            </Alert>
          )}
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

export class DosAndDonts {
  data: any;

  static get toolbox() {
    return {
      title: `Do's and dont's`,
      icon: '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" ><path d="m576-160-56-56 104-104-104-104 56-56 104 104 104-104 56 56-104 104 104 104-56 56-104-104-104 104Zm79-360L513-662l56-56 85 85 170-170 56 57-225 226ZM80-280v-80h360v80H80Zm0-320v-80h360v80H80Z"/></svg>',
    };
  }

  constructor({ data }) {
    this.data = data;
  }

  render() {
    let ui = document.createElement('div');
    let root = createRoot(ui);
    root.render(<InputUI {...this.data} />);
    ui.classList.add('dos-and-donts');

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

    //console.log(frameUrl);
    //console.log(this.data);

    return {
      ...getDetailsFromFigmaURL(frameUrl, 'decode'),
      frameExistsInFile:
        typeof this.data.frameExistsInFile != 'undefined' ?? true,
      caption,
    };
  }

  validate(savedData) {
    if (!savedData.fileId || !savedData.frameId) {
      //console.log('Not validated');
      return false;
    }

    return true;
  }
}
