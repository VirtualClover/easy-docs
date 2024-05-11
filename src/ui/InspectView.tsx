import * as _ from 'lodash';

import { Button } from '@mui/material';
import { EMPTY_DOC_OBJECT } from '../utils/constants';
import { PluginDataContext } from '../utils/PluginDataContext';
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
        <Typography variant="h1" align="center">
          📝
        </Typography>
        <Typography variant="h4" align="center">
          Select a doc frame
        </Typography>
        <Typography align="center">or</Typography>
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
