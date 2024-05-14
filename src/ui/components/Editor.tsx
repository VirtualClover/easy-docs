import * as _ from 'lodash';

import { DocData, EMPTY_AUTHOR_DATA, PageData } from '../../utils/constants';

import { Box } from '@mui/material';
import { EDITOR_TOOLS } from '../../utils/editor/editorConfig';
import { OutputData } from '@editorjs/editorjs';
import { PluginDataContext } from '../../utils/PluginDataContext';
import React from 'react';
import { clone } from '../../utils/clone';
import { createReactEditorJS } from 'react-editor-js';
import { formatPageData } from '../../utils/docs/formatPageData';
import { pushNewDataToFigma } from '../../utils/editor/pushNewDataToFigma';
import { reconcilePageData } from '../../utils/docs/reconcileData';

const ReactEditorJS = createReactEditorJS();

export const Editor = () => {
  const editorCore = React.useRef(null);
  const [stopUpdates, setStopUpdates] = React.useState(false);
  const [firstRender, setFirstRender] = React.useState(true);

  const pluginContext = React.useContext(PluginDataContext);

  React.useEffect(() => {
    const interval = setInterval(() => {
      if (!pluginContext.incomingFigmaChanges && !stopUpdates) {
        handleSaveEditor().then((data) => {
          /*console.log(
            'plugin context for reconciliation with new saved editor data:'
          );

          console.log(pluginContext.currentDocData);*/

          let reconciliation = reconcilePageData(
            {
              ...data,
              frameId:
                pluginContext.currentDocData.pages[pluginContext.activeTab]
                  .frameId,
            },
            pluginContext.currentDocData.pages[pluginContext.activeTab],
            true
          );

          if (reconciliation.changesNumber) {
            let pageData = reconciliation.data as PageData;
            formatPageData(pageData);
            console.log('Pre reconciliation current editor data');
            console.log(data);
            console.log('Pre reconciliation CURRENT CONTEXT DATA');
            console.log(pluginContext.currentDocData);
            let tempDoc: DocData = clone(pluginContext.currentDocData);
            tempDoc.pages[pluginContext.activeTab] = pageData;
            tempDoc.author = EMPTY_AUTHOR_DATA;
            pushNewDataToFigma(pluginContext, tempDoc, pageData.frameId);
          }
        });
      } else {
        //New figma changes
        if (!pluginContext.currentDocData.pages[pluginContext.activeTab]) {
          pluginContext.setActiveTab(0);
          handleUpdateData(pluginContext.currentDocData.pages[0]).then(() => {
            pluginContext.setIncomingFigmaChanges(false);
          });
        } else {
          handleUpdateData(
            pluginContext.currentDocData.pages[pluginContext.activeTab]
          ).then(() => {
            pluginContext.setIncomingFigmaChanges(false);
          });
        }
      }
    }, 400);
    return () => {
      //console.log('Cleared!');
      clearInterval(interval);
    };
  }, [
    pluginContext.currentDocData,
    pluginContext.incomingFigmaChanges,
    stopUpdates,
  ]);

  const handleInitialize = React.useCallback((instance) => {
    console.log('Initialized');
    //console.log(pluginContext.currentDocData);
    editorCore.current = instance;
    pluginContext.setIncomingFigmaChanges(false);
    if (firstRender) {
      setFirstRender(false);
    }
  }, []);

  const handleUpdateData = React.useCallback(async (data: OutputData) => {
    console.log('render');
    console.log(pluginContext.currentDocData);

    console.log(editorCore.current);
    console.log(firstRender);
    await editorCore.current.render(data);
  }, []);

  const handleSaveEditor = async () => {
    let newData: PageData = await editorCore.current.save(); //Page data
    return newData;
  };

  //Change tabs
  React.useEffect(() => {
    if (!firstRender) {
      setStopUpdates(true);
      handleUpdateData(
        pluginContext.currentDocData.pages[pluginContext.activeTab]
      ).then(() => {
        setStopUpdates(false);
      });
    }
  }, [pluginContext.activeTab]);

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
        tools={EDITOR_TOOLS}
        onInitialize={handleInitialize}
      />
    </Box>
  );
};
