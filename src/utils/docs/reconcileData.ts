import * as _ from 'lodash';

import { DocData, PageData, Reconciliation } from '../constants';

import { cleanseTextData } from '../cleanseTextData';
import { clone } from '../clone';
import { formatPageData } from './formatPageData';

/**
 * Evaluates if there are changes between two doc JSONs
 * @param newData
 * @param currentData
 * @param useCurrentDataFramesId
 * @param useCurrentDataSectionId
 * @returns
 */
export function reconcileDocData(
  newData: DocData,
  currentData: DocData,
  useCurrentDataFramesId: boolean = false,
  useCurrentDataSectionId: boolean = false
): Reconciliation {
  let clonedCurrentData: DocData = clone(currentData); //Data stored in context
  clonedCurrentData.pages = clonedCurrentData.pages.slice(
    0,
    newData.pages.length
  );
  let changesNumber = 0;

  for (let i = 0; i < newData.pages.length; i++) {
    let newPage = newData.pages[i];
    let currentDataPage = clonedCurrentData.pages[i];
    let frameId: string = '';
    if (currentDataPage) {
      let pageRecon = reconcilePageData(
        newPage,
        currentDataPage,
        useCurrentDataFramesId
      );

      let pageData = pageRecon.data as PageData;
      //console.log(pageRecon.data);

      if (pageRecon.changesNumber) {
        changesNumber += pageRecon.changesNumber;
        currentDataPage = pageData;
      }
      if (!useCurrentDataFramesId) {
        frameId = pageData.frameId;
      }
    } else {
      currentDataPage = newPage;
      changesNumber++;
    }
    clonedCurrentData.pages[i] = { ...currentDataPage, frameId };
    //console.log(clonedCurrentData.pages[i]);
    clonedCurrentData.sectionId =
      useCurrentDataSectionId && clonedCurrentData.sectionId
        ? currentData.sectionId
        : newData.sectionId;
  }
  if (newData.title != clonedCurrentData.title) {
    clonedCurrentData.title = newData.title;
    changesNumber++;
  }

  clonedCurrentData.author = newData.author;

  return { changesNumber, data: clonedCurrentData };
}

/**
 * Evaluates if there are changes between two page JSONs
 * @param newData
 * @param currentData
 * @param useCurrentDataFrameId
 * @returns
 */
export function reconcilePageData(
  newData: PageData,
  currentData: PageData,
  useCurrentDataFrameId: boolean = false
): Reconciliation {
  let clonedCurrentData: PageData = clone(currentData); //Data stored in context
  let changesNumber = 0;
  if (clonedCurrentData.blocks.length != newData.blocks.length) {
    clonedCurrentData.blocks = clonedCurrentData.blocks.slice(
      0,
      newData.blocks.length
    );
    changesNumber++;
  }
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
        currentDataBlock.data = cleanseTextData(newBlock.data);
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

  clonedCurrentData.frameId =
    useCurrentDataFrameId && clonedCurrentData.frameId
      ? currentData.frameId
      : newData.frameId;

  if (!useCurrentDataFrameId && currentData.frameId != newData.frameId) {
    changesNumber++;
  }

  formatPageData(clonedCurrentData);
  if (useCurrentDataFrameId) {
    /*console.log(newData.frameId);
    console.log(currentData.frameId);
    console.log(clonedCurrentData.frameId);*/
  }
  return { changesNumber, data: clonedCurrentData };
}
