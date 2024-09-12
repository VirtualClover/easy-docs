import * as _ from 'lodash';

import {
  AnyMetaData,
  BundleType,
  DocData,
  DocumentBundleMetaData,
  EMPTY_PAGE_METADATA,
  ExportFileFormat,
  FigmaFileBundleMetaData,
  FigmaFileDocData,
  FigmaPageBundleMetaData,
  FigmaPageDocData,
} from '../../utils/constants';
import {
  Box,
  FormControl,
  FormHelperText,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  downloadFile,
  generateDocSite,
  generateDocumentMetadata,
  generateFigmaFileMetaData,
  generateFigmaPageMetadata,
  generatePageExport,
} from '../../utils/exports/exportUtils';

import { BASE_STYLE_TOKENS } from '../../styles/base';
import { CodeBlock } from './CodeBlock';
import { ContentCopy } from '@mui/icons-material';
import { CopyToClipboard } from 'react-copy-to-clipboard'; // Using a library because for the life of me I cannot find a native workaround
import { ExportButton } from './ExportButton';
import JSZip from 'jszip';
import { METADATA_FILENAME } from '../../utils/constants/exportConstants';
import { PluginDataContext } from '../../utils/constants/PluginDataContext';
import React from 'react';
import { formatStringToFileName } from '../../utils/general/formatStringToFileName';
import { handleEditorError } from '../../utils/editor/handleEditorError';
import { handleFigmaError } from '../../utils/figma/handleFigmaError';

export const ExportView = (): JSX.Element => {
  const pluginContext = React.useContext(PluginDataContext);
  const [loading, setLoading] = React.useState(true);
  const [open, setOpen] = React.useState(false);
  const [docSiteSelected, setDocSiteSelected] = React.useState(false);
  //Freezing data so it doesnt mutate if something changes in figma
  const [mountedData, setMountedData] = React.useState(
    pluginContext.currentDocData
  );
  const [mountedActiveTab, setMountedActiveTab] = React.useState(
    pluginContext.activeTab
  );
  const [previewData, setPreviewdata] = React.useState('');
  const [previewFileName, setPreviewFileName] = React.useState(
    `file.${pluginContext.lastFormatUsed}`
  );
  const [scanInProgess, setScanInProgress] = React.useState(false);


  let setScanTimeOut = () => {
    setTimeout(() => {
      setScanInProgress(false);
      setLoading(false);
      handleEditorError('E1', null, pluginContext.setShowError, pluginContext.setErrorMessage);
    }, 600000);
  };

  let exportActions = [
    {
      label: 'Download current page',
      onClick: () =>
        downloadPage(
          previewData,
          previewFileName,
          pluginContext.lastFormatUsed
        ),
    },
    {
      label: 'Download whole document',
      onClick: () => {
        setLoading(true);
        generateDocumentExport(mountedData, pluginContext.lastFormatUsed).then(
          () => {
            setLoading(false);
          }
        );
      },
    },
    {
      label: 'Download all documents in Figma page',
      onClick: () => {
        setScanInProgress(true);
        setLoading(true);
        setScanTimeOut();
        parent.postMessage(
          {
            pluginMessage: {
              type: 'scan-whole-page-for-docs',
            },
          },
          '*'
        );
      },
    },
    {
      label: 'Download all documents in Figma file',
      onClick: () => {
        setScanInProgress(true);
        setLoading(true);
        setScanTimeOut();
        parent.postMessage(
          {
            pluginMessage: {
              type: 'scan-whole-file-for-docs',
            },
          },
          '*'
        );
      },
    },
    {
      label: 'Generate doc site',
      onClick: () => {
        setScanInProgress(true);
        setLoading(true);
        setScanTimeOut();
        parent.postMessage(
          {
            pluginMessage: {
              type: 'scan-whole-file-for-doc-site',
            },
          },
          '*'
        );
      },
    },
  ];

  /**
   * Donwloads the current selected page as a file depending on the format
   * @param data
   * @param fileName
   * @param format
   */
  let downloadPage = async (
    data: string,
    fileName: string,
    format: ExportFileFormat
  ) => {
    setLoading(true);
    const blob = new Blob([data], { type: 'text/plain' });
    downloadFile(blob, fileName, format);
    setLoading(false);
  };

  /**
   * Bundles all of the pages contained within a document, generates a zip and downloads it; if a zipDirectory param is provided, the function will only  add the files to it, else, it will trigger a file download
   * @param data
   * @param format
   * @param zipDirectory
   */
  let generateDocumentExport = async (
    data: DocData,
    format: ExportFileFormat,
    bundleType: BundleType = 'document',
    parentMetadata?: any,
    currentIndex: number[] = [0, 0],
    zipDirectory?: JSZip
  ) => {
    let currentDocumentMetadata: DocumentBundleMetaData;
    if (parentMetadata) {
      currentDocumentMetadata = bundleType === 'figmaFile' ? parentMetadata.directory[currentIndex[1]].directory[currentIndex[0]] : parentMetadata.directory[currentIndex[0]];
    } else {
      currentDocumentMetadata = generateDocumentMetadata(data, [], format);
    }

    let bundleName = currentDocumentMetadata.directoryName;
    const zip = zipDirectory ? zipDirectory.folder(bundleName) : new JSZip();

    for (const [i, page] of data.pages.entries()) {
      await generatePageExport(
        page,
        format,
        pluginContext.settings,
        parentMetadata ?? currentDocumentMetadata,
        bundleType,
        [i, ...currentIndex]
      ).then((data) => {
        let fileName = currentDocumentMetadata.directory[i].fileName;
        zip.file(fileName, data);
      });
    }

    if (!zipDirectory) {
      //Generate metadata file
      zip.file(METADATA_FILENAME, JSON.stringify(currentDocumentMetadata));
      const zipContent = await zip.generateAsync({ type: 'blob' });
      downloadFile(zipContent, bundleName, 'zip');
    }
  };

  /**
   * Bundles all of the documents contained within the current Figma Page; if a zipDirectory param is provided, the function will only  add the files to it, else, it will trigger a file download
   * @param data
   * @param format
   * @param zipDirectory
   * @returns
   */
  let generateFigmaPageBundleExport = async (
    data: FigmaPageDocData,
    format: ExportFileFormat,
    bundleType: BundleType = 'figmaPage',
    parentMetadata?: FigmaFileBundleMetaData,
    currentFigmaPageIndex: number = 0,
    zipDirectory?: JSZip
  ) => {
    let currentPageMetadata: FigmaPageBundleMetaData;
    if (parentMetadata) {
      currentPageMetadata = parentMetadata.directory[currentFigmaPageIndex];
    }
    else {
      currentPageMetadata = generateFigmaPageMetadata(
        data,
        [],
        format,
        Date.now().toString()
      );
    }
    let bundleName = currentPageMetadata.directoryName;

    const zip = zipDirectory ? zipDirectory.folder(bundleName) : new JSZip();

    for (const [i, document] of data.data.entries()) {
      await generateDocumentExport(
        document,
        format,
        bundleType,
        parentMetadata ?? currentPageMetadata,
        [i, currentFigmaPageIndex],
        zip
      );
    }

    if (!zipDirectory) {
      //Generate metadata file
      zip.file(METADATA_FILENAME, JSON.stringify(currentPageMetadata));
      const zipContent = await zip.generateAsync({ type: 'blob' });
      downloadFile(zipContent, bundleName, 'zip');
    }
  };

  /**
   * Bundles all of the pages with documents contained within the current Figma file and triggers a file download
   * @param data
   * @param format
   */
  let generateFigmaFileBundleExport = async (
    data: FigmaFileDocData,
    format: ExportFileFormat
  ) => {
    const zip = new JSZip();
    let currentFileMetadata = generateFigmaFileMetaData(
      data,
      format,
      Date.now().toString()
    );
    let finalZipName = currentFileMetadata.directoryName;

    for (const [i, page] of data.data.entries()) {
      await generateFigmaPageBundleExport(
        page,
        format,
        'figmaFile',
        currentFileMetadata,
        i,
        zip
      );
    }
    //Generate metadata file
    zip.file(METADATA_FILENAME, JSON.stringify(currentFileMetadata));
    const zipContent = await zip.generateAsync({ type: 'blob' });
    downloadFile(zipContent, finalZipName, 'zip');
  };

  React.useEffect(() => {
    setLoading(true);
    generatePageExport(
      mountedData.pages[mountedActiveTab],
      pluginContext.lastFormatUsed,
      pluginContext.settings,
      EMPTY_PAGE_METADATA,
      'page',
      [0, 0, 0]
    ).then((data) => {
      setPreviewdata(data);
      setLoading(false);
      setPreviewFileName(
        `${formatStringToFileName(mountedData.pages[mountedActiveTab].title)}.${pluginContext.lastFormatUsed
        }`
      );
    });
  }, [pluginContext.lastFormatUsed]);

  React.useEffect(() => {
    if (pluginContext.lastExportActionUsed == exportActions.length - 1) {
      pluginContext.setLastFormatUsed('html');
      setDocSiteSelected(true);
    } else {
      setDocSiteSelected(false);
    }
  }, [pluginContext.lastExportActionUsed]);

  /**
   * Check if the Plugin API sent a meesage data, it can recieve a bundle of documents within the current Figma page or a bundle of pages within a Figma file
   */
  let recieveMessage = () => {
    // Check if the scan was requested before doing anything 

    if (scanInProgess)
      onmessage = (event) => {
        if (event.data.pluginMessage && event.data.pluginMessage.type) {
          switch (event.data.pluginMessage.type) {
            case 'docs-in-page':
              generateFigmaPageBundleExport(
                event.data.pluginMessage.data,
                pluginContext.lastFormatUsed
              ).then(() => {
                setLoading(false);
                setScanInProgress(false);
              });
              break;

            case 'docs-in-file':
              generateFigmaFileBundleExport(
                event.data.pluginMessage.data,
                pluginContext.lastFormatUsed
              ).then(() => {
                setLoading(false);
                setScanInProgress(false);
              });
              break;

            case 'docs-in-file-for-doc-site':
              generateDocSite(
                event.data.pluginMessage.data,
                pluginContext.settings.customization
              ).then(() => {
                setLoading(false);
                setScanInProgress(false);
              });
              break;

            case 'generating-component-doc':
              pluginContext.setBuildingComponentDoc(true);
              break;

            case 'finished-generating-component-doc':
              pluginContext.setBuildingComponentDoc(false);
              break;

            default:
              break;
          }
        }
      };
  };

  React.useEffect(() => {
    const interval = setInterval(() => {
      //This function loops to check if the Plugin API sent a meesage data
      recieveMessage();
    }, 1);

    return () => clearInterval(interval);

  }, [scanInProgess]);



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
            value={pluginContext.lastFormatUsed}
            label="Choose a format"
            disabled={loading || docSiteSelected}
            onChange={(e) => {
              pluginContext.setLastFormatUsed(
                e.target.value as ExportFileFormat
              );
              pluginContext.setLastFormatUsed(
                e.target.value as ExportFileFormat
              );
            }}
          >
            <MenuItem value={'md'}>Markdown</MenuItem>
            <MenuItem value={'html'}>HTML</MenuItem>
            <MenuItem value={'json'}>JSON</MenuItem>
          </Select>
          {docSiteSelected && (
            <FormHelperText>
              The documentation site can only be generated in HTML.
            </FormHelperText>
          )}
        </FormControl>
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}
        gap={16}
      >
        <Box>
          <Typography variant="h4" sx={{ mb: BASE_STYLE_TOKENS.units.u8 }}>
            Preview
          </Typography>
          <Typography variant="caption">{previewFileName}</Typography>
        </Box>
        <Box>
          <CopyToClipboard
            text={previewData}
            options={{
              format:
                pluginContext.lastFormatUsed == 'html'
                  ? 'text/html'
                  : 'text/plain',
            }}
            onCopy={() => setOpen(true)}
          >
            <Tooltip title="Copy preview to clipboard">
              <span>
                <IconButton
                  style={{ borderRadius: 4 }}
                  aria-label="Copy preview to clipboard"
                  disabled={loading}
                >
                  <ContentCopy />
                </IconButton>
              </span>
            </Tooltip>
          </CopyToClipboard>
        </Box>
      </Box>
      <CodeBlock
        code={previewData}
        language={pluginContext.lastFormatUsed}
        loading={loading}
      />
      <Stack
        direction="row-reverse"
        sx={{ position: 'relative', bottom: 0, mt: 32 }}
        gap={8}
      >
        <ExportButton disabled={loading} actions={exportActions} />
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
