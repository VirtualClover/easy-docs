import * as React from 'react';

import { Box, Typography } from '@mui/material';

export let VersionBanner = () => {
  if (process.env.NODE_ENV == 'development') {
    return (
      <Box
        sx={{
          borderWidth: '1 0 1 0',
          p: 8,
          borderColor: `divider`,
          borderStyle: 'solid',
          bgcolor: 'background.paper',
        }}
      >
        <Typography variant="caption">
          🚧⚠ Development Build - V{process.env.npm_package_version}
        </Typography>
      </Box>
    );
  }

  if (
    process.env.npm_package_version &&
    process.env.npm_package_version.match(/beta/)
  ) {
    return (
      <Box
        sx={{
          borderWidth: '1 0 1 0',
          p: 8,
          borderColor: `divider`,
          borderStyle: 'solid',
          bgcolor: 'background.paper',
        }}
      >
        <Typography variant="caption">
          🚧 Beta Build - V{process.env.npm_package_version}
        </Typography>
      </Box>
    );
  }
};
