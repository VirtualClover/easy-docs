import * as _ from 'lodash';

import { DocData, PageData } from '../../utils/constants';
import React, { useEffect } from 'react';

import { Box } from '@mui/material';
import Header from '@editorjs/header';
import { PluginDataContext } from '../../utils/PluginDataContext';
import { clone } from '../../utils/clone';
import { createReactEditorJS } from 'react-editor-js';
import { formatPageData } from '../../utils/docs/formatPageData';
import { reconcilePageData } from '../../utils/docs/reconcileData';

const ReactEditorJS = createReactEditorJS();

export const Editor = () => {
  const editorCore = React.useRef(null);

  const pluginContext = React.useContext(PluginDataContext);

  React.useEffect(() => {
    const interval = setInterval(() => {
      if (!pluginContext.incomingFigmaChanges) {
        handleSaveEditor().then((data) => {
          let reconciliation = reconcilePageData(
            data,
            pluginContext.currentDocData.pages[pluginContext.activeTab],
            true
          );
          if (reconciliation.changesNumber) {
            pushNewDataToFigma(reconciliation.data);
          }
        });
      } else {
        //console.log('incoming fimga changes');
        //console.log(pluginContext.incomingFigmaChanges);
      }
    }, 400);
    return () => {
      //console.log('Cleared!');
      clearInterval(interval);
    };
  }, [pluginContext.currentDocData, pluginContext.incomingFigmaChanges]);

  const handleInitialize = React.useCallback((instance) => {
    //console.log('Initialized');
    //console.log(pluginContext.currentDocData);
    editorCore.current = instance;
    pluginContext.setIncomingFigmaChanges(false);
  }, []);

  const handleUpdateData = React.useCallback(async (data) => {
    //console.log('Rendered new data');
    await editorCore.current.render(data);
  }, []);

  const handleSaveEditor = async () => {
    let newData: PageData = await editorCore.current.save(); //Page data
    return newData;
  };

  const pushNewDataToFigma = async (newData: PageData) => {
    let reconciliation = reconcilePageData(
      newData,
      pluginContext.currentDocData.pages[pluginContext.activeTab]
    );
    if (reconciliation.changesNumber) {
      formatPageData(reconciliation.data);
      let tempDoc: DocData = clone(pluginContext.currentDocData);
      formatPageData(reconciliation.data);
      tempDoc.pages[pluginContext.activeTab] =  reconciliation.data;
      pluginContext.setCurrentDocData(tempDoc);
      pluginContext.setIncomingEditorChanges(true);
      parent.postMessage(
        {
          pluginMessage: {
            type: 'update-selected-doc',
            data: tempDoc,
            editedFrame: reconciliation.data.frameId,
          },
        },
        '*'
      );
      //pluginContext.setIncomingEditorChanges(false);
    }
  };

  React.useEffect(() => {
    if (pluginContext.incomingFigmaChanges) {
      handleUpdateData(
        pluginContext.currentDocData.pages[pluginContext.activeTab]
      ).then(() => {
        pluginContext.setIncomingFigmaChanges(false);
      });
    }
  }, [pluginContext.incomingFigmaChanges]);

  return (
    <Box
      id="editorjs"
      sx={(theme) => ({
        ...theme.typography,
        fontSize: 14,
      })}
    >
      <ReactEditorJS
        defaultValue={
          pluginContext.currentDocData.pages[pluginContext.activeTab]
        }
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
