import 'prismjs';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-markup';

import { ExportSkeleton } from './skeletons/ExportSkeleton';
import { PrimsWrapper } from '../../styles/prism_styles';
import React from 'react';

declare var Prism: any;

export const CodeBlock = ({ code, language, loading }) => {
  React.useEffect(() => {
    Prism.highlightAll();
  }, [code, language, loading]);

  return (
    <PrimsWrapper sx={{}}>
      {!loading ? (
        <pre>
          <code className={`language-${language}`}>{code}</code>
        </pre>
      ) : (
        <ExportSkeleton />
      )}
    </PrimsWrapper>
  );
};
