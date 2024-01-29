import {
  BaseFileData,
  DocData,
  EMPTY_DOC_OBJECT,
  FIGMA_LAST_EDITED_KEY,
  FIGMA_NAMESPACE,
  PageData,
} from '../constants';

import { formatPageData } from './formatPageData';

export function generateJSONFromFigmaContent(
  section: SectionNode
): DocData {
  let JSONData: DocData = {
    title: section.name,
    pages: [],
  };

  let stringData = figma.root.getSharedPluginData('EasyDocs', 'components');
  let componentData: BaseFileData = JSON.parse(stringData);

  if (section.children) {
    let children = section.children;

    for (let i = 0; i < children.length; i++) {
      let child = children[i];
      if (child.type == 'FRAME') {
        JSONData.pages.push(generatePageDataFromFrame(child, componentData));
      }
    }

    return JSONData;
  }

  return EMPTY_DOC_OBJECT;
}

function generatePageDataFromFrame(
  frame: FrameNode,
  componentData: BaseFileData
): PageData {
  let pageData: PageData = {
    blocks: [],
    title: '',
    frameId: frame.id,
  };

  if (frame.children) {
    let children = frame.children;
    for (let i = 0; i < children.length; i++) {
      let childNode = children[i];
      let editedDate =
        parseInt(
          childNode.getSharedPluginData(FIGMA_NAMESPACE, FIGMA_LAST_EDITED_KEY),
          10
        ) || Date.now();
      if (childNode.type == 'INSTANCE') {
        let mainCompId =
          childNode.mainComponent.parent.type == 'COMPONENT_SET'
            ? childNode.mainComponent.parent.id
            : childNode.mainComponent.id;
        switch (mainCompId) {
          case componentData.header.id:
            let headerContent =
              childNode.componentProperties[componentData.header.contentProp]
                .value;
            pageData.blocks.push({
              type: 'header',
              lastEdited: editedDate,
              data: {
                text: headerContent,
                level: parseInt(
                  childNode.componentProperties[
                    componentData.header.levelProp.key
                  ].value as string,
                  10
                ),
              },
            });
            if (!pageData.title && typeof headerContent === 'string') {
              pageData.title = headerContent;
            }
            break;
          case componentData.paragraph.id:
            pageData.blocks.push({
              type: 'paragraph',
              lastEdited: editedDate,
              data: {
                text: childNode.componentProperties[
                  componentData.paragraph.contentProp
                ].value,
              },
            });
            break;
        }
      }
    }
  }

  formatPageData(pageData);
  return pageData;
}
