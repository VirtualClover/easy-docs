import * as _ from 'lodash';

import { DocData, PageData } from '../constants';

import { clone } from '../clone';

export function compareDocData(newData: DocData, currentData: DocData) {}

export function reconcilePageData(newData: PageData, currentData: PageData) {
  let clonedCurrentData: PageData = clone(currentData); //Data stored in context
  clonedCurrentData.blocks = clonedCurrentData.blocks.slice(
    0,
    newData.blocks.length
  );
  clonedCurrentData.blocks = clonedCurrentData.blocks.slice(
    0,
    newData.blocks.length
  );
  let changesNumber = 0;
  let pageTitle;
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
      }
    } else {
      clonedCurrentData.blocks[i] = newBlock;
      changesNumber++;
    }
  }

  return { changesNumber, data: clonedCurrentData };
}
