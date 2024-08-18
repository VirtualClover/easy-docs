import 'prismjs';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-markup';

import { Box } from '@mui/material';
import { ExportSkeleton } from './skeletons/ExportSkeleton';
import { PrimsWrapper } from '../../styles/prism_styles';
import React from 'react';

declare var Prism: any;

export const CodeBlock = ({ code, language, loading }) => {
  const [mountedHeight, setMountedHeight] = React.useState(0);
  const ref = React.useRef(null);

  React.useEffect(() => {
    Prism.highlightAll();
    if (!loading) {
      setMountedHeight(ref.current.clientHeight);
    }
  }, [code, language, loading]);

  return (
    <PrimsWrapper sx={{}}>
      {!loading ? (
        <pre ref={ref}>
          <code className={`language-${language}`}>{code}</code>
        </pre>
      ) : (
        <Box height={mountedHeight ?? 'auto'}>
          <ExportSkeleton />
        </Box>
      )}
    </PrimsWrapper>
  );
};
