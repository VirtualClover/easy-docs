import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material';

import { BASE_STYLE_TOKENS } from '../../styles/base';
import { ExportButton } from './ExportButton';
import { ExportFileFormat } from '../../utils/constants';
import React from 'react';

interface componentProps {
  pageData: string;
}

export const ExportView = ({ pageData }: componentProps): JSX.Element => {
  const [format, setFormat] = React.useState('md');

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
              setFormat(e.target.value);
            }}
          >
            <MenuItem value={'md'}>Markdown</MenuItem>
            <MenuItem value={'html'}>HTML</MenuItem>
            <MenuItem value={'json'}>JSON</MenuItem>
          </Select>
          <FormHelperText>Learn more about formats here.</FormHelperText>
        </FormControl>
      </Box>
      <Typography variant="h4" sx={{ mb: BASE_STYLE_TOKENS.units.u8 }}>
        Preview
      </Typography>
      <Typography variant="caption">Page_1.{format}</Typography>
      <Box
        sx={{
          bgcolor: 'grey.900',
          maxHeight: 300,
          p: 16,
          borderRadius: 1,
          overflow: 'auto',
        }}
      >
        <Typography
          variant="body1"
          sx={{ whiteSpace: 'pre-wrap', color: 'grey.100' }}
        >
          {pageData}
        </Typography>
      </Box>
      <Stack
        direction="row-reverse"
        sx={{ position: 'relative', bottom: 0, mt: 32 }}
        gap={8}
      >
        <ExportButton />
        <Button>Copy to clipboard</Button>
      </Stack>
    </>
  );
};
