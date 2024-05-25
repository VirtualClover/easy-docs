import { Alert, Typography, styled } from '@mui/material';
import {
  decodeStringForFigma,
  encodeStringForHTML,
} from '../../cleanseTextData';
import {
  generateFigmaURL,
  getDetailsFromFigmaURL,
} from '../../general/urlHandlers';

import React from 'react';
import { createRoot } from 'react-dom/client';
import { figmaIcon } from '../../../assets/svgs';

//https://www.figma.com/file/XUdu09UGUDZUBaEXvkrNnX/Untitled?type=design&node-id=7%3A2206&mode=design&t=fAGyucibEv9Dl8od-1
//`https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Ffile%2F${fileId}%2FUntitled%3Ftype%3Ddesign%26node-id%3D${frameId}

interface ComponentProps {
  frameId: string;
  fileId: string;
  frameExistsInFile: boolean;
  caption: string;
}

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

const InputUI = (blockData: ComponentProps) => {
  //https://www.figma.com/design/tt54zCyis2CgMo6wRIkvB0/Untitled?node-id=16%3A249&t=Bad05SFQnNtoGy4z-1

  let [frameExistsInFile, setFrameExistsInFile] = React.useState(
    blockData.frameExistsInFile
  );

  let [frameDetails, setFrameDetails] = React.useState({
    frameId: blockData.frameId,
    fileId: blockData.fileId,
  });

  let [src, setSrc] = React.useState(
    generateFigmaURL(frameDetails.fileId, frameDetails.frameId, 'share')
  );

  let [preview, setPreview] = React.useState(<></>);
  let [errorMsg, setErrorMsg] = React.useState(<></>);

  React.useEffect(() => {
    console.log('effect riggered');

    if (frameDetails.fileId && frameDetails.frameId) {
      setPreview(
        <>
          {blockData && !frameExistsInFile && (
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
            defaultValue={decodeStringForFigma(blockData.caption)}
          />
        </>
      );
      setErrorMsg(<></>);
    } else {
      setPreview(<></>);
      if (src) {
        setErrorMsg(
          <Typography
            variant="caption"
            sx={{ color: 'error.main', fontWeight: 600 }}
          >
            Please, enter a valid Figma URL
          </Typography>
        );
      }
    }
  }, [frameDetails]);

  return (
    <BlockWrapper>
      <input
        className="cdx-input"
        id="cdx-display-frame-frame-url"
        placeholder={'Add Figma link here!'}
        style={{ flex: 1 }}
        defaultValue={src}
        onChange={(e) => {
          console.log(e.target.value);
          console.log(src);
          setSrc(e.target.value);
          setFrameDetails(getDetailsFromFigmaURL(e.target.value, 'decode'));
        }}
      />
      {errorMsg}
      {preview}
    </BlockWrapper>
  );
};

export class DisplayFrame {
  data: any;

  static get toolbox() {
    return {
      title: 'Figma Frame',
      icon: figmaIcon,
    };
  }

  constructor({ data }) {
    this.data = data;
    console.log(data);
  }

  render() {
    let ui = document.createElement('div');
    let root = createRoot(ui);
    root.render(<InputUI {...this.data} />);
    //console.log('render');
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

    //console.log('frame ei¿xists');
    //console.log(this.data.frameExistsInFile);

    return {
      ...getDetailsFromFigmaURL(frameUrl, 'decode'),
      frameExistsInFile: this.data.frameExistsInFile,
      caption: encodeStringForHTML(caption ?? ''),
    };
  }

  validate(savedData) {
    return true;
  }
}
