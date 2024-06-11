import { Alert, Stack, Typography, styled } from '@mui/material';
import { DEFAULT_SETTINGS, GuidelineType } from '../../constants';
import {
  cautionIcon,
  doIcon,
  dontIcon,
  dosAndDontsIcon,
} from '../../../assets/svgs';
import {
  decodeStringForFigma,
  encodeStringForHTML,
} from '../../general/cleanseTextData';
import {
  generateFigmaURL,
  getDetailsFromFigmaURL,
} from '../../general/urlHandlers';

import React from 'react';
import { createRoot } from 'react-dom/client';
import { mapDosAndDontsToStatus } from '../../general/statusAssetsUtils';

//https://www.figma.com/file/XUdu09UGUDZUBaEXvkrNnX/Untitled?type=design&node-id=7%3A2206&mode=design&t=fAGyucibEv9Dl8od-1
//`https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Ffile%2F${fileId}%2FUntitled%3Ftype%3Ddesign%26node-id%3D${frameId}

interface ComponentProps {
  frameId: string;
  fileId: string;
  type: GuidelineType;
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
  let [bgColor, setBgColor] = React.useState(
    DEFAULT_SETTINGS.customization.palette.status.success.muted
  );

  React.useEffect(() => {
    //console.log('effect riggered');

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
            id="cdx-dos-and-donts-caption"
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

  React.useEffect(() => {
    let statusColor = mapDosAndDontsToStatus(blockData.type);
    setBgColor(
      DEFAULT_SETTINGS.customization.palette.status[statusColor].muted
    );
  }, []);

  return (
    <BlockWrapper
      id={'cdx-dos-and-donts-block'}
      style={{
        background: bgColor,
        outline: `6px solid ${bgColor}`,
      }}
    >
      <Stack direction="row" gap={2}>
        {/*<select
          className="cdx-input"
          name="Guideline type"
          id="cdx-dos-and-donts-type"
          style={{ width: 100 }}
          defaultValue={type}
          onChange={(e) => {
            setType(e.target.value as GuidelineType);
          }}
        >
          <option value="do">✅ Do</option>
          <option value="dont">❌ Don't</option>
          <option value="caution">⚠ Caution</option>
        </select>*/}
        <input
          className="cdx-input"
          id="cdx-dos-and-donts-frame-url"
          placeholder={'Add Figma link here!'}
          style={{ flex: 1 }}
          defaultValue={src}
          onChange={(e) => {
            //console.log(e.target.value);
            //console.log(src);
            setSrc(e.target.value);
            setFrameDetails(getDetailsFromFigmaURL(e.target.value, 'decode'));
          }}
        />
      </Stack>
      {errorMsg}
      {preview}
    </BlockWrapper>
  );
};

export class DosAndDonts {
  data: any;
  wrapper: HTMLDivElement | undefined;
  settings: any;

  static get toolbox() {
    return {
      title: `Dos and Don'ts`,
      icon: dosAndDontsIcon,
    };
  }

  constructor({ data }) {
    this.data = {
      frameId: data.frameId || '',
      fileId: data.fileId || '',
      type: data.type || 'do',
      frameExistsInFile:
        data.frameExistsInFile !== undefined ? data.frameExistsInFile : true,
      caption: data.caption || '',
    };
  }

  renderSettings() {
    return [
      {
        icon: doIcon,
        label: 'Do',
        toggle: 'type',
        isActive: this.data.type == 'do',
        closeOnActivate: true,
        onActivate: () => {
          this.data.type = 'do';
        },
      },
      {
        icon: dontIcon,
        label: `Don't`,
        toggle: 'type',
        isActive: this.data.type == 'dont',
        closeOnActivate: true,
        onActivate: () => {
          this.data.type = 'dont';
        },
      },
      {
        icon: cautionIcon,
        label: `Caution`,
        toggle: 'type',
        isActive: this.data.type == 'caution',
        closeOnActivate: true,
        onActivate: () => {
          this.data.type = 'caution';
        },
      },
    ];
  }

  /**
   * @private
   * Click on the Settings Button
   * @param {string} tune — tune name from this.settings
   */
  _toggleType(type: GuidelineType) {
    //console.log('Block type changed', type);
    this.data.type = type;
  }

  render() {
    let ui = document.createElement('div');
    let root = createRoot(ui);
    root.render(<InputUI {...this.data} />);
    //console.log('render');
    ui.classList.add('dos-and-donts');

    return ui;
  }

  save(blockContent) {
    let caption;
    let frameUrl;
    if (blockContent.querySelector('#cdx-dos-and-donts-frame-url')) {
      frameUrl = blockContent.querySelector(
        '#cdx-dos-and-donts-frame-url'
      ).value;
    }

    if (blockContent.querySelector('#cdx-dos-and-donts-block')) {
      let bgColor =
        DEFAULT_SETTINGS.customization.palette.status[
          mapDosAndDontsToStatus(this.data.type)
        ].muted;
      let blockWrapper = blockContent.querySelector('#cdx-dos-and-donts-block');
      blockWrapper.style.outline = `6px solid ${bgColor}`;
      blockWrapper.style.background = bgColor;
    }

    if (blockContent.querySelector('#cdx-dos-and-donts-caption')) {
      caption = blockContent.querySelector('#cdx-dos-and-donts-caption').value;
    }

    //console.log('frame ei¿xists');
    //console.log(this.data.frameExistsInFile);

    return {
      ...getDetailsFromFigmaURL(frameUrl, 'decode'),
      type: this.data.type,
      frameExistsInFile: this.data.frameExistsInFile,
      caption: encodeStringForHTML(caption ?? ''),
    };
  }

  validate(savedData) {
    return true;
  }
}
