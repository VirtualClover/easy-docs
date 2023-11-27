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

export const Editor = ({ activeTab }) => {
  const editorCore = React.useRef(null);

  const pluginContext = React.useContext(PluginDataContext);

  React.useEffect(() => {
    const interval = setInterval(() => {
      if (!pluginContext.incomingFigmaChanges) {
        handleSaveData();
      } else {
        //console.log('incoming fimga changes');
        //console.log(pluginContext.incomingFigmaChanges);
      }
    }, 500);
    return () => {
      console.log('Cleared!');
      clearInterval(interval);
    };
  }, [pluginContext.currentDocData, pluginContext.incomingFigmaChanges]);

  const handleInitialize = React.useCallback((instance) => {
    editorCore.current = instance;
    pluginContext.setIncomingFigmaChanges(false);
  }, []);

  const handleUpdateData = React.useCallback(async (data) => {
    await editorCore.current.render(data);
  }, []);

  const handleSaveData = async () => {
    let newData: PageData = await editorCore.current.save(); //Page data
    let currentData: PageData = clone(
      pluginContext.currentDocData.pages[activeTab]
    ); //Data stored in context
    currentData.blocks = currentData.blocks.slice(0, newData.blocks.length);
    let changesNumber = 0;
    let pageTitle;
    for (let i = 0; i < newData.blocks.length; i++) {
      let newBlock = newData.blocks[i];
      let currentDataBlock = currentData.blocks[i];
      if (currentDataBlock) {
        if (!pageTitle && currentDataBlock.type == 'header') {
          pageTitle = currentDataBlock.data.text;
          currentData.title = pageTitle;
        }

        if (
          !_.isEqual(newBlock.data, currentDataBlock.data) ||
          newBlock.type != currentDataBlock.type
        ) {
          console.log('block not equal');
          changesNumber++;
          currentDataBlock.data = newBlock.data;
          currentDataBlock.lastEdited = Date.now();
          currentDataBlock.type = newBlock.type;
        }
      } else {
        currentData.blocks[i] = newBlock;
        changesNumber++;
      }
    }
    if (changesNumber) {
      pluginContext.setIncomingEditorChanges(true);
      let tempDoc: DocData = clone(pluginContext.currentDocData);
      tempDoc.pages[activeTab] = currentData;
      pluginContext.setCurrentDocData(tempDoc);
      parent.postMessage(
        {
          pluginMessage: {
            type: 'update-selected-doc',
            data: tempDoc,
            editedFrame: activeTab,
          },
        },
        '*'
      );
      pluginContext.setIncomingEditorChanges(false);
    }
  };

  React.useEffect(() => {
    if (pluginContext.incomingFigmaChanges) {
      handleUpdateData(pluginContext.currentDocData.pages[activeTab]).then(
        () => {
          pluginContext.setIncomingFigmaChanges(false);
        }
      );
    }
  }, [pluginContext.currentDocData]);

  return (
    <Box
      id="editorjs"
      sx={(theme) => ({
        ...theme.typography,
        fontSize: 14,
      })}
    >
      <ReactEditorJS
        defaultValue={pluginContext.currentDocData.pages[activeTab]}
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
