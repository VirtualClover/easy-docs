import * as _ from 'lodash';

import { Button } from '@mui/material';
import { OutdatedComponentsAnim } from '../../assets/animations/Animations';
import React from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export const NewDocDetectedView = () => {
  return (
    <>
      <Stack
        spacing={1}
        alignItems="center"
        justifyContent={'center'}
        style={{ flex: '1 1 auto' }}
        gap={32}
        padding={32}
      >
        <OutdatedComponentsAnim />
        <Typography variant="h4" align="center">
          Initialize this doc!
        </Typography>
        <Typography align="center">
          This documentation seems to have been created from scratch in Figma.
          That's cool, the plugin just need to scan it for the first time.
          <br />
          <br /> <b>Do you wish to do it now?</b>
          <small>
            <br />
            (This process needs tobe be done only once)
          </small>
        </Typography>
        <Button
          variant="contained"
          onClick={() => {
            parent.postMessage(
              { pluginMessage: { type: 'update-outdated-components' } },
              '*'
            );
          }}
        >
          Yes, scan it!
        </Button>
      </Stack>
    </>
  );
};
