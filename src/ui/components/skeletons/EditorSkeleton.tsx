import { Skeleton, Stack } from '@mui/material';

import React from 'react';

export const EditorSkeleton = () => (
  <>
    <Stack gap={14} sx={{ mt: 32 }}>
      <Skeleton variant="rounded" width={250} height={32} />
      <Skeleton variant="rounded" width={500} height={14} />
      <Skeleton variant="rounded" width={500} height={14} />
    </Stack>
    <Stack gap={14} sx={{ mt: 32 }}>
      <Skeleton variant="rounded" width={250} height={24} />
      <Skeleton variant="rounded" width={500} height={14} />
      <Skeleton variant="rounded" width={500} height={14} />
      <Skeleton variant="rounded" width={500} height={14} />
      <Skeleton variant="rounded" width={500} height={14} />
    </Stack>
  </>
);
