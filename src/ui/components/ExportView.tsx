import * as _ from 'lodash';

import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  Stack,
  Typography,
} from '@mui/material';
import { DocData, ExportFileFormat } from '../../utils/constants/constants';
import {
  generateDocMap,
  generatePageExport,
} from '../../utils/docs/exportUtils';

import { BASE_STYLE_TOKENS } from '../../styles/base';
import { CodeBlock } from './CodeBlock';
import { CopyToClipboard } from 'react-copy-to-clipboard'; // Using a library because for the life of me I cannot find a native workaround
import { ExportButton } from './ExportButton';
import JSZip from 'jszip';
import { PluginDataContext } from '../../utils/constants/PluginDataContext';
import React from 'react';
import { formatStringToFileName } from '../../utils/general/formatStringToFileName';

export const ExportView = (): JSX.Element => {
  const pluginContext = React.useContext(PluginDataContext);
  const [format, setFormat] = React.useState(pluginContext.lastFormatUsed);
  const [loading, setLoading] = React.useState(true);
  const [open, setOpen] = React.useState(false);
  //Freezing data so it doesnt mutate if something's changes in figma
  const [mountedData, setMountedData] = React.useState(
    pluginContext.currentDocData
  );
  const [mountedActiveTab, setMountedActiveTab] = React.useState(
    pluginContext.activeTab
  );
  const [previewData, setPreviewdata] = React.useState('');
  const [previewFileName, setPreviewFileName] = React.useState(
    `file.${format}`
  );
  const [docMap, setDocMap] = React.useState(generateDocMap(mountedData));
  const [scanInProgess, setScanInProgress] = React.useState(false);

  let downloadPage = async (
    data: string,
    fileName: string,
    format: ExportFileFormat
  ) => {
    setLoading(true);
    const blob = new Blob([data], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = fileName;
    link.href = url;
    link.click();
    setLoading(false);
  };

  let downloadDocument = async (data: DocData, format: ExportFileFormat) => {
    setLoading(true);
    const zip = new JSZip();
    for (const page of data.pages) {
      await generatePageExport(
        page,
        format,
        pluginContext.settings,
        docMap
      ).then((data) => {
        zip.file(`${formatStringToFileName(page.title)}.${format}`, data);
      });
    }
    const zipContent = await zip.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(zipContent);
    link.download = `${formatStringToFileName(data.title)}.zip`;
    link.click();
    setLoading(false);
  };

  let downloadDocsInPage = async (
    data: { documents: DocData[]; title: string },
    format: ExportFileFormat
  ) => {
    setLoading(true);
    const zip = new JSZip();
    let folderNames = [];
    for (const document of data.documents) {
      let folderName = formatStringToFileName(document.title);
      let tries = 1;
      while (folderNames.includes(folderName)){
        folderName = folderName+`_${tries}`;
        tries++;
      }
      folderNames.push(folderName);
      let folder = zip.folder(folderName);
      for (const page of document.pages) {
        await generatePageExport(
          page,
          format,
          pluginContext.settings,
          docMap
        ).then((data) => {
          folder.file(`${formatStringToFileName(page.title)}.${format}`, data);
        });
      }
    }
    const zipContent = await zip.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(zipContent);
    link.download = `${formatStringToFileName(data.title)}.zip`;
    link.click();
    setLoading(false);
  };

  React.useEffect(() => {
    setLoading(true);
    generatePageExport(
      mountedData.pages[mountedActiveTab],
      format,
      pluginContext.settings,
      docMap
    ).then((data) => {
      setPreviewdata(data);
      setLoading(false);
      setPreviewFileName(
        `${formatStringToFileName(
          mountedData.pages[mountedActiveTab].title
        )}.${format}`
      );
    });
  }, [format]);

  let recieveMessage = () => {
    if (scanInProgess)
      onmessage = (event) => {
        if (event.data.pluginMessage) {
          switch (event.data.pluginMessage.type) {
            case 'docs-in-page':
              downloadDocsInPage(event.data.pluginMessage.data, format);
              console.log(event.data.pluginMessage);
              setScanInProgress(false);
              break;

            default:
              break;
          }
        }
      };
  };

  recieveMessage();

  return (
    <>
      <Typography variant="h3" sx={{ mb: BASE_STYLE_TOKENS.units.u32 }}>
        Export documentation
      </Typography>
      <Box>
        <FormControl sx={{ m: 1, width: '100%', mb: 16 }}>
          <InputLabel id="format-select">Choose a format</InputLabel>
          <Select
            labelId="format-select"
            value={format}
            label="Choose a format"
            disabled={loading}
            onChange={(e) => {
              setFormat(e.target.value as ExportFileFormat);
              pluginContext.setLastFormatUsed(
                e.target.value as ExportFileFormat
              );
            }}
          >
            <MenuItem value={'md'}>Markdown</MenuItem>
            <MenuItem value={'html'}>HTML</MenuItem>
            <MenuItem value={'json'}>JSON</MenuItem>
          </Select>
        </FormControl>
      </Box>
      <Typography variant="h4" sx={{ mb: BASE_STYLE_TOKENS.units.u8 }}>
        Preview
      </Typography>
      <Typography variant="caption">{previewFileName}</Typography>
      <CodeBlock code={previewData} language={format} loading={loading} />
      <Stack
        direction="row-reverse"
        sx={{ position: 'relative', bottom: 0, mt: 32 }}
        gap={8}
      >
        <ExportButton
          disabled={loading}
          actions={[
            {
              label: 'Download current page',
              onClick: () => downloadPage(previewData, previewFileName, format),
            },
            {
              label: 'Download whole document',
              onClick: () => downloadDocument(mountedData, format),
            },
            {
              label: 'Download all documents in Figma page',
              onClick: () => {
                parent.postMessage(
                  {
                    pluginMessage: {
                      type: 'scan-whole-page-for-docs',
                    },
                  },
                  '*'
                );
                setScanInProgress(true);
              },
            },
          ]}
        />
        <CopyToClipboard text={previewData} onCopy={() => setOpen(true)}>
          <Button disabled={loading}>Copy to clipboard</Button>
        </CopyToClipboard>
        <Snackbar
          open={open}
          autoHideDuration={1000}
          onClose={() => setOpen(false)}
          message="Copied to clipboard!"
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        />
      </Stack>
    </>
  );
};
