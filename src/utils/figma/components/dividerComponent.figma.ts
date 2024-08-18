import {
  BaseComponentData,
  BlockData,
  FIGMA_COMPONENT_PREFIX,
} from '../../constants';
import {
  FIGMA_COMPONENT_DATA_KEY,
  FIGMA_COMPONENT_VERSION_KEY,
  FIGMA_NAMESPACE,
} from '../../constants';

import { getPluginSettings } from '../getPluginSettings';
import { setNodeStrokeColor } from '../setNodeStrokeColor';

export async function createDividerComponent(parent: FrameNode) {
  let settings = getPluginSettings();
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
    settings.customization.palette.divider.simple
  );
  parent.appendChild(component);
  return { id: component.id };
}

export async function generateDividerInstance(
  componentVersion: number
): Promise<InstanceNode> {
  let componentData: BaseComponentData = JSON.parse(
    figma.root.getSharedPluginData(FIGMA_NAMESPACE, FIGMA_COMPONENT_DATA_KEY)
  );
  let component: BaseNode;
  await figma
    .getNodeByIdAsync(componentData.components.divider.id)
    .then((node) => {
      component = node;
    });

  //console.log(content);

  if (component.type == 'COMPONENT') {
    let instance = component.createInstance();

    instance.setSharedPluginData(
      FIGMA_NAMESPACE,
      FIGMA_COMPONENT_VERSION_KEY,
      componentVersion.toString()
    );

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
