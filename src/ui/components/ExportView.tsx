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

import { BASE_STYLE_TOKENS } from '../../styles/base';
import { CodeBlock } from './CodeBlock';
import { CopyToClipboard } from 'react-copy-to-clipboard'; // Using a library because for the life of me I cannot find a native workaround
import { ExportButton } from './ExportButton';
import { ExportFileFormat } from '../../utils/constants';
import { PluginDataContext } from '../../utils/PluginDataContext';
import React from 'react';
import { generatePageExport } from '../../utils/docs/exportUtils';

export const ExportView = (): JSX.Element => {
  const [format, setFormat] = React.useState('md' as ExportFileFormat);
  const [open, setOpen] = React.useState(false);
  const pluginContext = React.useContext(PluginDataContext);
  //Freezing data so it doesnt mutate if something's changes in figma
  const [mountedData, setMountedData] = React.useState(
    pluginContext.currentDocData
  );
  const [mountedActiveTab, setMountedActiveTab] = React.useState(
    pluginContext.activeTab
  );
  const [previewData, setPreviewdata] = React.useState(
    generatePageExport(mountedData.pages[mountedActiveTab], format)
  );

  React.useEffect(() => {
    setPreviewdata(
      generatePageExport(mountedData.pages[mountedActiveTab], format)
    );
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
        {_.snakeCase(mountedData.pages[mountedActiveTab].title)}.{format}
      </Typography>
      <CodeBlock code={previewData} language={format} />
      <Stack
        direction="row-reverse"
        sx={{ position: 'relative', bottom: 0, mt: 32 }}
        gap={8}
      >
        <ExportButton />
        <CopyToClipboard text={previewData} onCopy={() => setOpen(true)}>
          <Button>Copy to clipboard</Button>
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
