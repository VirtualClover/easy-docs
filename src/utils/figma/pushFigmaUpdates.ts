import { DocData } from '../constants/constants';
import { generateJSONFromFigmaContent } from '../docs/generateJSONFromFigmaContent';
import { reconcileDocData } from '../docs/reconcileData';
import { scanCurrentSelectionForDocs } from './scanCurrentSelectionForDocs';

/**
 * Generates doc data from a section and then pushes it
 * @returns
 */
export async function pushFigmaUpdates(lastFetchDoc:DocData): Promise<{
  type: string;
  data: any;
  selectedFrame: number;
}> {
  let selectedFrame: number = 0;
  let parentSection: SectionNode;
  let parentFrame: FrameNode;

  await scanCurrentSelectionForDocs()
    .then((res) => {
      if (res.frame && res.section) {
        parentSection = res.section;
        parentFrame = res.frame;
        selectedFrame = res.selectedFrame;
      }
    })
    .catch((e) => console.error(e));

  if (parentSection && parentSection.children.length) {
    let generatedDoc: DocData;
    await generateJSONFromFigmaContent(parentSection).then(
      (data) => (generatedDoc = data)
    );
    //console.log('Generated doc');
    //console.log(generatedDoc);

    if (generatedDoc.pages) {

      let reconciliation = reconcileDocData(generatedDoc, lastFetchDoc);
      //console.log(reconciliation);
      if (reconciliation.changesNumber) {
        return {
          type: 'new-node-data',
          data: reconciliation.data,
          selectedFrame,
        };
      } else {
        return { type: 'same-node-data', data: '', selectedFrame };
      }
    }
  }

  return { type: 'no-node', data: '', selectedFrame };
}
