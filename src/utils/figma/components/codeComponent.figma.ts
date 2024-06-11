import {
  BlockData,
  DEFAULT_SETTINGS,
  FIGMA_COMPONENT_PREFIX,
} from '../../constants';
import {
  decodeStringForFigma,
  encodeStringForHTML,
} from '../../general/cleanseTextData';

import { BaseFileData } from '../../constants';
import { setNodeFills } from '../setNodeFills';

export async function createCodeComponent(parent: FrameNode) {
  let component: ComponentNode;
  let contentProperty: string;
  await figma
    .loadFontAsync({ family: 'Roboto Mono', style: 'Regular' })
    .then(() => {
      component = figma.createComponent();
      component.resizeWithoutConstraints(400, 20);
      component.layoutMode = 'HORIZONTAL';
      component.counterAxisSizingMode = 'AUTO';
      component.primaryAxisSizingMode = 'FIXED';
      component.name = `${FIGMA_COMPONENT_PREFIX}Code`;
      component.paddingTop = 8;
      component.paddingBottom = 32;
      //Inner wrapper
      let innerWrapper = figma.createFrame();
      innerWrapper.name = 'innerWrapper';
      innerWrapper.resizeWithoutConstraints(400, 20);
      innerWrapper.layoutMode = 'VERTICAL';
      innerWrapper.primaryAxisSizingMode = 'AUTO';
      innerWrapper.verticalPadding = 32;
      innerWrapper.horizontalPadding = 32;
      innerWrapper.itemSpacing = 8;
      innerWrapper.cornerRadius = 16;
      setNodeFills(
        innerWrapper,
        DEFAULT_SETTINGS.customization.palette.surface
      );
      component.appendChild(innerWrapper);
      innerWrapper.layoutSizingHorizontal = 'FILL';
      //Code
      let codeNode = figma.createText();
      codeNode.fontName = { family: 'Roboto Mono', style: 'Regular' };
      codeNode.fontSize = 24;
      codeNode.characters = 'Code';
      setNodeFills(
        codeNode,
        DEFAULT_SETTINGS.customization.palette.onBackground.high
      );
      innerWrapper.appendChild(codeNode);
      codeNode.layoutSizingHorizontal = 'FILL';
      contentProperty = component.addComponentProperty(
        'content',
        'TEXT',
        'Code'
      );
      codeNode.componentPropertyReferences = { characters: contentProperty };

      parent.appendChild(component);
    });
  return {
    id: component.id,
    contentProp: contentProperty,
  };
}

export async function generateCodeInstance(data): Promise<InstanceNode> {
  let componentData: BaseFileData = JSON.parse(
    figma.root.getSharedPluginData('EasyDocs', 'components')
  );
  let component: BaseNode;
  await figma.getNodeByIdAsync(componentData.code.id).then((node) => {
    component = node;
  });
  if (component.type == 'COMPONENT') {
    let instance = component.createInstance();
    instance.setProperties({
      [componentData.code.contentProp]: decodeStringForFigma(data.code),
    });
    return instance;
    //instance.set
  }
  return null;
}

export async function generateBlockDataFromCode(
  node: InstanceNode,
  componentData: BaseFileData,
  lastEdited: number = Date.now(),
  figmaNodeId?: string
): Promise<BlockData> {
  return {
    type: 'code',
    lastEdited,
    figmaNodeId,
    data: {
      code: encodeStringForHTML(
        node.componentProperties[componentData.code.contentProp].value as string
      ),
    },
  };
}
