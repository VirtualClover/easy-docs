import { Alert, Typography, styled } from '@mui/material';
import { DEFAULT_SETTINGS, DisplayFrameBlockData } from '../../constants';
import {
  decodeStringForFigma,
  encodeStringForHTML,
} from '../../general/cleanseTextData';
import {
  generateFigmaURL,
  getDetailsFromFigmaURL,
} from '../../general/urlHandlers';

import { PluginThemeProvider } from '../../../ui/components/PluginThemeProvider';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { figmaIcon } from '../../../assets/svgs';



let IFrame = styled('iframe')(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  width: '100%',
  height: 300,
  borderRadius: 4,
}));

let BlockWrapper = styled('div')(({ theme }) => ({
  margin: `24px ${0}`,
  width: '100%',
  borderRadius: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
}));

const InputUI = (blockData: DisplayFrameBlockData) => {
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

  let bgColor = DEFAULT_SETTINGS.customization.palette.status.neutral.muted;

  let [preview, setPreview] = React.useState(<></>);
  let [errorMsg, setErrorMsg] = React.useState(<></>);

  React.useEffect(() => {

    if (frameDetails.fileId && frameDetails.frameId) {
      setPreview(
        <>
          {blockData &&
            typeof frameExistsInFile !== 'undefined' &&
            !frameExistsInFile && (
              <Alert severity="warning">
                The frame referenced in this block was possibly deleted or the frame is located on another file.
              </Alert>
            )}
          <IFrame
            src={generateFigmaURL(
              frameDetails.fileId,
              frameDetails.frameId,
              'embed'
            )}
            loading="lazy"
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
    <BlockWrapper
      style={{
        background: bgColor,
        outline: `6px solid ${bgColor}`,
      }}
    >
      <input
        className="cdx-input"
        id="cdx-display-frame-frame-url"
        placeholder={'Add Figma link here!'}
        style={{ flex: 1 }}
        defaultValue={src}
        onChange={(e) => {
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
  data: DisplayFrameBlockData;
  readOnly: boolean;

  static get toolbox() {
    return {
      title: 'Figma Frame',
      icon: figmaIcon,
    };
  }

  constructor({ data,readOnly }) {
    this.data = data;
    this.readOnly = readOnly;
  }

  static get isReadOnlySupported() {
    return true;
  }

  render() {
    let ui = document.createElement('div');
    let root = createRoot(ui);
    root.render(<PluginThemeProvider><InputUI {...this.data} /></PluginThemeProvider>);
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
      frameExistsInFile: this.data.frameExistsInFile,
      caption: encodeStringForHTML(caption ?? ''),
    };
  }

  validate(savedData) {
    return true;
  }
}
