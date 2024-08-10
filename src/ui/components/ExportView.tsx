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
import {
  generateDocMap,
  generatePageExport,
} from '../../utils/docs/exportUtils';

import { BASE_STYLE_TOKENS } from '../../styles/base';
import { CodeBlock } from './CodeBlock';
import { CopyToClipboard } from 'react-copy-to-clipboard'; // Using a library because for the life of me I cannot find a native workaround
import { ExportButton } from './ExportButton';
import { ExportFileFormat } from '../../utils/constants/constants';
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
  const [docMap, setDocMap] = React.useState(generateDocMap(mountedData));

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
    });
  }, [format]);

  return (
    <>
      <Typography variant="h3" sx={{ mb: BASE_STYLE_TOKENS.units.u32 }}>
        Export documentation
      </Typography>
      <Box>
        <FormControl sx={{ m: 1, width: '100%', mb: 16 }}>
          <InputLabel id="demo-simple-select-helper-label">
            Choose a format
          </InputLabel>
          <Select
            labelId="demo-simple-select-helper-label"
            id="demo-simple-select-helper"
            value={format}
            label="Choose a format"
            onChange={(e) => {
              setFormat(e.target.value as ExportFileFormat);
              pluginContext.setLastFormatUsed(e.target.value as ExportFileFormat);
            }}
          >
            <MenuItem value={'md'}>Markdown</MenuItem>
            <MenuItem value={'html'}>HTML</MenuItem>
            <MenuItem value={'json'}>JSON</MenuItem>
          </Select>
          {/*<FormHelperText>Learn more about formats here.</FormHelperText>*/}
        </FormControl>
      </Box>
      <Typography variant="h4" sx={{ mb: BASE_STYLE_TOKENS.units.u8 }}>
        Preview
      </Typography>
      <Typography variant="caption">
        {formatStringToFileName(mountedData.pages[mountedActiveTab].title)}.
        {format}
      </Typography>
      <CodeBlock code={previewData} language={format} loading={loading} />
      <Stack
        direction="row-reverse"
        sx={{ position: 'relative', bottom: 0, mt: 32 }}
        gap={8}
      >
        <ExportButton disabled={loading} />
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
