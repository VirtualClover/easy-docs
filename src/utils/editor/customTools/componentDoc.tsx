import * as _ from 'lodash';

import { Alert, Typography, styled } from '@mui/material';
import {
  ComponentDocBlockData,
  EMPTY_COMPONENT_SHARED_DATA,
  EMPTY_VARIANT_SHARED_DATA,
  FrameDetailsFromURL,
} from '../../constants';
import {
  generateFigmaURL,
  getDetailsFromFigmaURL,
} from '../../general/urlHandlers';

import { PluginThemeProvider } from '../../../ui/components/PluginThemeProvider';
import React from 'react';
import { clone } from '../../general/clone';
import { componentIcon } from '../../../assets/svgs';
import { createRoot } from 'react-dom/client';

//https://www.figma.com/file/XUdu09UGUDZUBaEXvkrNnX/Untitled?type=design&node-id=7%3A2206&mode=design&t=fAGyucibEv9Dl8od-1
//`https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Ffile%2F${fileId}%2FUntitled%3Ftype%3Ddesign%26node-id%3D${frameId}

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

const InputUI = (blockData: ComponentDocBlockData) => {
  //https://www.figma.com/design/tt54zCyis2CgMo6wRIkvB0/Untitled?node-id=16%3A249&t=Bad05SFQnNtoGy4z-1

  let [frameExistsInFile, setFrameExistsInFile] = React.useState(
    blockData.variants && blockData.variants.length
      ? blockData.variants[0].displayFrame.existsInFile
      : undefined
  );

  let [frameDetails, setFrameDetails] = React.useState(
    blockData.variants && blockData.variants.length
      ? {
          frameId: blockData.variants[0].displayFrame.id,
          fileId: blockData.fileId,
        }
      : {
          frameId: '',
          fileId: '',
        }
  );

  let [src, setSrc] = React.useState(
    generateFigmaURL(frameDetails.fileId, frameDetails.frameId, 'share')
  );

  let bgColor = '#7E4CC0';

  let [preview, setPreview] = React.useState(<></>);
  let [errorMsg, setErrorMsg] = React.useState(<></>);

  React.useEffect(() => {
    //console.log('effect riggered');

    if (frameDetails.fileId && frameDetails.frameId) {
      setPreview(
        <>
          {blockData &&
            typeof frameExistsInFile !== 'undefined' &&
            !frameExistsInFile && (
              <Alert severity="warning">
                The frame referenced in this block was possibly deleted or the
                frame is located on another file.
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
        id="cdx-component-specs-frame-url"
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

export class ComponentDoc {
  data: ComponentDocBlockData;
  readOnly: boolean;

  static get toolbox() {
    return {
      title: 'Component Documentation',
      icon: componentIcon,
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
    ui.classList.add('component-specs');

    return ui;
  }

  save(blockContent): ComponentDocBlockData {
    let frameUrl;
    let frameDetails: FrameDetailsFromURL;
    if (blockContent.querySelector('#cdx-component-specs-frame-url')) {
      frameUrl = blockContent.querySelector(
        '#cdx-component-specs-frame-url'
      ).value;
      frameDetails = getDetailsFromFigmaURL(frameUrl, 'decode');
    }

    let initData = {
      ...EMPTY_COMPONENT_SHARED_DATA,
      ...this.data,
    } as ComponentDocBlockData;

    initData.fileId = frameDetails.fileId;

    if (!initData.variants.length) {
      initData.variants.push(clone(EMPTY_VARIANT_SHARED_DATA));
    }

    initData.variants[0].displayFrame = {
      id: frameDetails.frameId,
      existsInFile:
        initData.variants.length &&
        initData.variants[0].displayFrame.existsInFile != undefined
          ? initData.variants[0].displayFrame.existsInFile
          : undefined,
    };

    return initData;
  }

  validate(savedData) {
    return true;
  }
}
