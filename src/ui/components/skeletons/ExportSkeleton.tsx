import { Skeleton, Stack } from '@mui/material';

import React from 'react';

export const ExportSkeleton = () => (
  <>
    <Stack gap={14} sx={{ mt: 32 }}>
      <Skeleton variant="rounded" width={250} height={32} />
      <Skeleton variant="rounded" width={500} height={14} />
      <Skeleton variant="rounded" width={500} height={14} />
    </Stack>
  </>
);
