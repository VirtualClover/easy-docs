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
    }, 500);
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
    let newData = await editorCore.current.save(); //Page data
    let currentData = clone(pluginContext.currentDocData.pages[activeTab]); //Data stored in context
    let changesNumber = 0;
    for (let i = 0; i < newData.blocks.length; i++) {
      let newBlock = newData.blocks[i];
      let currentDataBlock = currentData.blocks[i];
      if (
        !_.isEqual(newBlock.data, currentDataBlock.data) ||
        newBlock.type != currentDataBlock.type
      ) {
        console.log('block not equal');
        console.log(newBlock.data);
        console.log(currentDataBlock.data);
        console.log(newBlock.type);
        console.log(currentDataBlock.type);
        
        
        
        let tempData = _.merge(currentDataBlock, newBlock);
        changesNumber++;
        currentDataBlock = tempData;
      }
    }
    if (changesNumber) {
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

/**
 *       for (let i = 0; i < savedData.blocks.length; i++) {
        if (
          !_.isEqual(
            savedData.blocks[i],
            currentDocDataPage.blocks[i]
          )
        ){
          let tempDataBlock = {...savedData.blocks[i], id:currentDocDataPage.blocks}
        }
        
      }
 */

/**
       * 
       * 
       * 
    if (
      !_.isEqual(
        savedData.blocks,
        pluginContext.currentDocData.pages[activeTab].blocks
      )
    ) {
      console.log('Editor update: data not equal');
      console.log(savedData.blocks);
      console.log(pluginContext.currentDocData.pages[activeTab].blocks);
      console.log(
        _.merge(
          pluginContext.currentDocData.pages[activeTab].blocks,
          savedData.blocks
        )
      );
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
      pluginContext.setLoadingState('NONE');
    }
       * 
       */
