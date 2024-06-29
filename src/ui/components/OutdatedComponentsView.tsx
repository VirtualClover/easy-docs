import * as _ from 'lodash';

import { Button } from '@mui/material';
import { OutdatedComponentsAnim } from '../../assets/animations/Animations';
import React from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export const OutDatedComponentsView = () => {
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
          There seems to be outdated components in this frame!
        </Typography>
        <Typography align="center">
          Components get outdated when the plugin creates new main components
          either by the deletion of the previous one or a by a breaking update.
          <br />
          <br /> <b>Do you wish to update them through the plugin?</b>
          <small>
            <br />
            (You can also do this process manually through Figma)
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
          Yes, Update them!
        </Button>
      </Stack>
    </>
  );
};
