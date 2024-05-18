import 'prismjs';
import 'prismjs/components/prism-json';
import 'prismjs/themes/prism-okaidia.css';

//import '../../styles/prism.css';
import { Box } from '@mui/material';
import React from 'react';

declare var Prism: any;

export const CodeBlock = ({ code, language }) => {
  React.useEffect(() => {
    Prism.highlightAll();
  }, [code, language]);

  return (
    <Box
      sx={{
        borderRadius: 1,
        overflow: 'auto',
        maxHeight: 225,
      }}
    >
      <pre>
        <code className={`language-json`}>{code}</code>
      </pre>
    </Box>
  );
};
