import {
  BlockData,
  DEFAULT_SETTINGS,
  FIGMA_COMPONENT_PREFIX,
} from '../../constants';

import { BaseFileData } from '../../constants';
import { setNodeStrokeColor } from '../setNodeStrokeColor';

export async function createDividerComponent(parent: FrameNode) {
  let component: ComponentNode;
  component = figma.createComponent();
  component.resizeWithoutConstraints(400, 20);
  component.layoutMode = 'HORIZONTAL';
  component.counterAxisSizingMode = 'AUTO';
  component.primaryAxisSizingMode = 'FIXED';
  component.paddingTop = 16;
  component.paddingBottom = 32;
  component.name = `${FIGMA_COMPONENT_PREFIX}Divider`;
  //Add line
  let lineNode = figma.createLine();
  component.appendChild(lineNode);
  lineNode.layoutSizingHorizontal = 'FILL';
  lineNode.name = 'divider';
  lineNode.strokeWeight = 2;
  setNodeStrokeColor(
    lineNode,
    DEFAULT_SETTINGS.customization.palette.divider.simple
  );
  parent.appendChild(component);
  return { id: component.id };
}

export async function generateDividerInstance(): Promise<InstanceNode> {
  let componentData: BaseFileData = JSON.parse(
    figma.root.getSharedPluginData('EasyDocs', 'components')
  );
  let component: BaseNode;
  await figma.getNodeByIdAsync(componentData.divider.id).then((node) => {
    component = node;
  });

  //console.log(content);

  if (component.type == 'COMPONENT') {
    let instance = component.createInstance();

    return instance;
    //instance.set
  }
  return null;
}

export async function generateBlockDataFromDivider(
  lastEdited: number = Date.now(),
  figmaNodeId?: string
): Promise<BlockData> {
  return {
    type: 'divider',
    lastEdited,
    figmaNodeId,
    data: {},
  };
}
