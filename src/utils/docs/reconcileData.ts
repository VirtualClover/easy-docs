import * as _ from 'lodash';

import { DocData, PageData } from '../constants';

import { clone } from '../clone';

export function reconcileDocData(newData: DocData, currentData: DocData) {
  let clonedCurrentData: DocData = clone(currentData); //Data stored in context
  clonedCurrentData.pages = clonedCurrentData.pages.slice(
    0,
    newData.pages.length
  );
  let changesNumber = 0;

  for (let i = 0; i < newData.pages.length; i++) {
    let newPage = newData.pages[i];
    let currentDataPage = clonedCurrentData.pages[i];
    if (currentDataPage) {
      let pageRecon = reconcilePageData(newPage, currentDataPage);
      if (pageRecon.changesNumber) {
        changesNumber += pageRecon.changesNumber;
        currentDataPage = pageRecon.data;
      }
    } else {
      currentDataPage = newPage;
      changesNumber++;
    }
  }

  return { changesNumber, data: clonedCurrentData };
}

export function reconcilePageData(newData: PageData, currentData: PageData) {
  let clonedCurrentData: PageData = clone(currentData); //Data stored in context
  clonedCurrentData.blocks = clonedCurrentData.blocks.slice(
    0,
    newData.blocks.length
  );
  let changesNumber = 0;
  for (let i = 0; i < newData.blocks.length; i++) {
    let newBlock = newData.blocks[i];
    let currentDataBlock = clonedCurrentData.blocks[i];
    if (currentDataBlock) {
      if (
        !_.isEqual(newBlock.data, currentDataBlock.data) ||
        newBlock.type != currentDataBlock.type
      ) {
        //console.log('block not equal');
        changesNumber++;
        currentDataBlock.data = newBlock.data;
        currentDataBlock.lastEdited = Date.now();
        currentDataBlock.type = newBlock.type;
        currentDataBlock.figmaNodeId = currentDataBlock.figmaNodeId
          ? currentDataBlock.figmaNodeId
          : newBlock.figmaNodeId;
      }
    } else {
      clonedCurrentData.blocks[i] = newBlock;
      changesNumber++;
    }
  }
  clonedCurrentData.frameId = newData.frameId;

  return { changesNumber, data: clonedCurrentData };
}
