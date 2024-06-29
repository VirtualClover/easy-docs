import * as _ from 'lodash';

import { Button } from '@mui/material';
import { InspectAnim } from '../assets/animations/Animations';
import React from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export const InspectView = () => {
  return (
    <>
      <Stack
        spacing={1}
        alignItems="center"
        justifyContent={'center'}
        style={{ flex: '1 1 auto' }}
      >
        <InspectAnim />
        <Typography variant="h3" align="center">
          Select a doc frame
        </Typography>
        <Typography align="center" sx={{ paddingBottom: 6 }}>
          or
        </Typography>
        <Button
          variant="contained"
          onClick={() => {
            parent.postMessage(
              { pluginMessage: { type: 'create-new-doc' } },
              '*'
            );
          }}
        >
          Create new docs
        </Button>
      </Stack>
    </>
  );
};
