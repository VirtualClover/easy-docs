import * as _ from 'lodash';

import { DEFAULT_PLUGIN_DATA, DocData, PageData } from '../../utils/constants';
import React, { useEffect } from 'react';

import { Box } from '@mui/material';
import Header from '@editorjs/header';
import { PluginDataContext } from '../../utils/PluginDataContext';
import { clone } from '../../utils/clone';
import { createReactEditorJS } from 'react-editor-js';

interface ComponentProps {
  data: PageData;
  activeTab: number;
}

const ReactEditorJS = createReactEditorJS();

export const Editor = ({ data, activeTab }) => {
  const editorCore = React.useRef(null);

  const pluginContext = React.useContext(PluginDataContext);

  React.useEffect(() => {
    const interval = setInterval(() => {
      handleSaveData();
    }, 1);
    return () => {
      console.log('Cleared!');
      clearInterval(interval);
    };
  }, [pluginContext.currentDocData]);

  const handleInitialize = React.useCallback((instance) => {
    editorCore.current = instance;
  }, []);

  const handleUpdateData = React.useCallback(async (data) => {
    await editorCore.current.render(data);
  }, []);

  const handleSaveData = async () => {
    let savedData = await editorCore.current.save();
    if (
      !_.isEqual(
        savedData.blocks,
        pluginContext.currentDocData.pages[activeTab].blocks
      )
    ) {
      pluginContext.setLoadingState('MINOR');
      let tempData: DocData = clone(pluginContext.currentDocData);
      tempData.pages[activeTab] = savedData;
      pluginContext.setCurrentDocData(tempData);
      parent.postMessage(
        {
          pluginMessage: {
            type: 'update-selected-doc',
            data: pluginContext.currentDocData,
            editedFrame: activeTab,
          },
        },
        '*'
      );
      console.log(pluginContext.currentDocData.pages[0].blocks);
    }
  };

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
              levels: [1, 2, 3, 4, 5, 6],
              defaultLevel: 2,
            },
          },
        }}
        onInitialize={handleInitialize}
      />
    </Box>
  );
};
