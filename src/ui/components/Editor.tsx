import { DEFAULT_DOC_DATA, FrameData } from '../../utils/constants';
import React, { useEffect } from 'react';

import { Box } from '@mui/material';
import Header from '@editorjs/header';
import { createReactEditorJS } from 'react-editor-js';

interface ComponentProps {
  data: FrameData;
}

const ReactEditorJS = createReactEditorJS();

export const Editor = ({ data }) => {
  const editorCore = React.useRef(null);

  const handleInitialize = React.useCallback((instance) => {
    editorCore.current = instance;
  }, []);

  const handleUpdateData = React.useCallback(async (data) => {
    await editorCore.current.render(data);
  }, []);

  React.useEffect(() => {
    handleUpdateData(data);
  }, [data]);

  return (
    <Box
      id="editorjs"
      sx={(theme) => ({
        ...theme.typography,
        fontSize: 14,
      })}
    >
      <ReactEditorJS
        defaultValue={data}
        tools={{
          header: {
            class: Header,
            config: {
              placeholder: 'Enter a header',
              levels: [2, 3, 4, 5, 6],
              defaultLevel: 2,
            },
          },
        }}
        onInitialize={handleInitialize}
      />
    </Box>
  );
};
