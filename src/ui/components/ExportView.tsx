import * as _ from 'lodash';

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
  DocData,
  DocumentBundleMetaData,
  ExportFileFormat,
  FigmaFileBundleMetaData,
  FigmaFileDocData,
  FigmaPageBundleMetaData,
  FigmaPageDocData,
  PageBundleMetaData,
} from '../../utils/constants';
import {
  downloadFile,
  generateDocSite,
  generatePageExport,
} from '../../utils/docs/exportUtils';

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

export const ExportView = (): JSX.Element => {
  const pluginContext = React.useContext(PluginDataContext);
  const [loading, setLoading] = React.useState(true);
  const [open, setOpen] = React.useState(false);
  const [docSiteSelected, setDocSiteSelected] = React.useState(false);
  //Freezing data so it doesnt mutate if something's changes in figma
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
    {
      label: 'Download all documents in Figma file',
      onClick: () => {
        parent.postMessage(
          {
            pluginMessage: {
              type: 'scan-whole-file-for-docs',
            },
          },
          '*'
        );
        setScanInProgress(true);
      },
    },
    {
      label: 'Generate doc site',
      onClick: () => {
        parent.postMessage(
          {
            pluginMessage: {
              type: 'scan-whole-file-for-doc-site',
            },
          },
          '*'
        );
        setScanInProgress(true);
      },
    },
  ];

  /**
   * Check if the current folder name has been used in the directory (using a stirng array as a directory list), if it has been used, the function appends a number(loops however many times necessaryif the number appended also has been used); if it has not been used the it returns the name and pushes the name into the array
   * @param folderNamesUsed
   * @param folderName
   * @returns The foldername iterated or not
   */
  let checkIfFolderNameOk = (
    folderNamesUsed: string[],
    folderName: string
  ): string => {
    if (folderNamesUsed) {
      let tries = 1;
      while (folderNamesUsed.includes(folderName)) {
        folderName = folderName + `_${tries}`;
        tries++;
      }
    }
    folderNamesUsed.push(folderName);
    return folderName;
  };

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
    zipDirectory?: JSZip,
    directoryNamesUsed: string[] = []
  ) => {
    let bundleName = checkIfFolderNameOk(
      directoryNamesUsed,
      formatStringToFileName(data.title)
    );
    const zip = zipDirectory ? zipDirectory.folder(bundleName) : new JSZip();
    let fileNames = [];
    let metaData: DocumentBundleMetaData = {
      title: data.title,
      directoryName: bundleName,
      sectionId: data.sectionId,
      lastEdited: data.lastEdited,
      directory: [],
    };
    for (const page of data.pages) {
      await generatePageExport(page, format, pluginContext.settings, []).then(
        (data) => {
          let fileName = `${checkIfFolderNameOk(
            fileNames,
            formatStringToFileName(page.title)
          )}.${format}`;
          let pageMetaData: PageBundleMetaData = {
            title: page.title,
            frameId: page.frameId,
            lastEdited: page.time ? page.time.toString() : '',
            fileName,
          };
          metaData.directory.push(pageMetaData), zip.file(fileName, data);
        }
      );
    }

    if (!zipDirectory) {
      //Generate metadata file
      zip.file(METADATA_FILENAME, JSON.stringify(metaData));
      const zipContent = await zip.generateAsync({ type: 'blob' });
      downloadFile(zipContent, bundleName, 'zip');
    }
    return metaData;
  };

  /**
   * Bundles all of the documents contained within the current Figma Page; if a zipDirectory param is provided, the function will only  add the files to it, else, it will trigger a file download
   * @param data
   * @param format
   * @param zipDirectory
   * @returns
   */
  let generatePageBundleExport = async (
    data: FigmaPageDocData,
    format: ExportFileFormat,
    zipDirectory?: JSZip,
    directoryNamesUsed: string[] = []
  ) => {
    let bundleName = checkIfFolderNameOk(
      directoryNamesUsed,
      formatStringToFileName(data.title)
    );
    const zip = zipDirectory ? zipDirectory.folder(bundleName) : new JSZip();
    let pageBundleMetaData: FigmaPageBundleMetaData = {
      title: data.title,
      pageId: data.pageId,
      directoryName: bundleName,
      generatedAt: Date.now().toString(),
      directory: [],
    };
    let documentDirectoryNamesUsed = [];

    for (const document of data.data) {
      await generateDocumentExport(
        document,
        format,
        zip,
        documentDirectoryNamesUsed
      ).then((metaData) => {
        pageBundleMetaData.directory.push(metaData);
      });
    }

    if (!zipDirectory) {
      //Generate metadata file
      zip.file(METADATA_FILENAME, JSON.stringify(pageBundleMetaData));
      const zipContent = await zip.generateAsync({ type: 'blob' });
      downloadFile(zipContent, bundleName, 'zip');
    }

    return pageBundleMetaData;
  };

  /**
   * Bundles all of the pages with documents contained within the current Figma file and triggers a file download
   * @param data
   * @param format
   */
  let generateFileBundleExport = async (
    data: FigmaFileDocData,
    format: ExportFileFormat
  ) => {
    const zip = new JSZip();
    let pageDirectoryNames = [];
    let finalZipName = formatStringToFileName(data.title);
    let fileBundleMetaData: FigmaFileBundleMetaData = {
      title: data.title,
      directoryName: finalZipName,
      generatedAt: Date.now().toString(),
      directory: [],
    };

    for (const page of data.data) {
      await generatePageBundleExport(
        page,
        format,
        zip,
        pageDirectoryNames
      ).then((metaData) => {
        fileBundleMetaData.directory.push(metaData);
      });
    }
    //Generate metadata file
    zip.file(METADATA_FILENAME, JSON.stringify(fileBundleMetaData));
    const zipContent = await zip.generateAsync({ type: 'blob' });
    downloadFile(zipContent, finalZipName, 'zip');
  };

  React.useEffect(() => {
    setLoading(true);
    generatePageExport(
      mountedData.pages[mountedActiveTab],
      pluginContext.lastFormatUsed,
      pluginContext.settings,
      []
    ).then((data) => {
      setPreviewdata(data);
      setLoading(false);
      setPreviewFileName(
        `${formatStringToFileName(mountedData.pages[mountedActiveTab].title)}.${
          pluginContext.lastFormatUsed
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
              setLoading(true);
              generatePageBundleExport(
                event.data.pluginMessage.data,
                pluginContext.lastFormatUsed
              ).then(() => {
                setLoading(false);
                setScanInProgress(false);
              });
              break;

            case 'docs-in-file':
              setLoading(true);
              generateFileBundleExport(
                event.data.pluginMessage.data,
                pluginContext.lastFormatUsed
              ).then(() => {
                setLoading(false);
                setScanInProgress(false);
              });
              break;

            case 'docs-in-file-for-doc-site':
              setLoading(true);
              generateDocSite(
                event.data.pluginMessage.data,
                pluginContext.settings.customization
              ).then(() => {
                setLoading(false);
                setScanInProgress(false);
              });
              break;

            default:
              break;
          }
        }
      };
  };

  //This function loops to check if the Plugin API sent a meesage data
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
          <CopyToClipboard text={previewData} onCopy={() => setOpen(true)}>
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
