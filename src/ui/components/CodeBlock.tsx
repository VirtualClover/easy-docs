import 'prismjs';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-markup';

//import '../../styles/prism.css';
import { PrimsWrapper } from '../../styles/prism_styles';
import React from 'react';

//import 'prismjs/themes/prism-okaidia.css';

declare var Prism: any;

export const CodeBlock = ({ code, language }) => {
  React.useEffect(() => {
    Prism.highlightAll();
  }, [code, language]);

  return (
    <PrimsWrapper sx={{}}>
      <pre>
        <code className={`language-${language}`}>{code}</code>
      </pre>
    </PrimsWrapper>
  );
};
