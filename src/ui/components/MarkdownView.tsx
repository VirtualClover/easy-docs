import { Box, Typography } from '@mui/material';

import React from 'react';

interface componentProps {
  markdown: string;
}

export const MarkdownView = ({ markdown }: componentProps): JSX.Element => {
  return (
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
        {markdown}
      </Typography>
    </Box>
  );
};
