import {
  BaseComponentData,
  DEFAULT_SETTINGS,
  FIGMA_COMPONENT_PREFIX,
} from '../../constants/constants';
import {
  FIGMA_COMPONENT_DATA_KEY,
  FIGMA_COMPONENT_VERSION_KEY,
  FIGMA_NAMESPACE,
} from '../../constants';

import { decodeStringForFigma } from '../../general/cleanseTextData';
import { setNodeFills } from '../setNodeFills';

export async function createBrokenLinkComponent(parent: FrameNode) {
  let component: ComponentNode;
  let captionProperty: string;
  await figma.loadFontAsync({ family: 'Inter', style: 'Bold' }).then(() => {
    //Component
    component = figma.createComponent();
    component.resizeWithoutConstraints(300, 1);
    component.layoutMode = 'VERTICAL';
    component.primaryAxisSizingMode = 'AUTO';
    component.itemSpacing = 16;
    component.name = `${FIGMA_COMPONENT_PREFIX}BrokenLink`;
    component.primaryAxisAlignItems = 'CENTER';
    component.counterAxisAlignItems = 'CENTER';

    //Link icon
    let svgString =
      '<svg width="141" height="135" viewBox="0 0 141 135" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M122.177 93.0682L111.91 82.5C116.473 81.25 120.181 78.8352 123.033 75.2557C125.885 71.6761 127.311 67.5 127.311 62.7273C127.311 57.0455 125.314 52.2159 121.322 48.2386C117.329 44.2614 112.481 42.2727 106.777 42.2727H79.3981V28.6364H106.777C116.245 28.6364 124.316 31.9602 130.99 38.608C137.663 45.2557 141 53.2955 141 62.7273C141 69.2045 139.317 75.1705 135.952 80.625C132.587 86.0795 127.995 90.2273 122.177 93.0682ZM98.9053 69.5455L85.216 55.9091H99.932V69.5455H98.9053ZM125.942 135L0 9.54545L9.58252 0L135.524 125.455L125.942 135ZM65.7087 96.8182H38.3301C28.8617 96.8182 20.7907 93.4943 14.1171 86.8466C7.44357 80.1989 4.1068 72.1591 4.1068 62.7273C4.1068 54.8864 6.50243 47.8977 11.2937 41.7614C16.085 35.625 22.2451 31.5909 29.7743 29.6591L42.4369 42.2727H38.3301C32.6262 42.2727 27.7779 44.2614 23.7852 48.2386C19.7925 52.2159 17.7961 57.0455 17.7961 62.7273C17.7961 68.4091 19.7925 73.2386 23.7852 77.2159C27.7779 81.1932 32.6262 83.1818 38.3301 83.1818H65.7087V96.8182ZM45.1748 69.5455V55.9091H56.2973L69.8155 69.5455H45.1748Z" fill="#626262"/></svg>';
    let svgNode = figma.createNodeFromSvg(svgString);
    svgNode.resize(66, 63);
    component.appendChild(svgNode);

    //Broken link message
    let messageNode = figma.createText();
    messageNode.fontName = { family: 'Inter', style: 'Bold' };
    messageNode.fontSize = 24;
    messageNode.characters = 'Preview not available.';
    messageNode.textAlignHorizontal = 'CENTER';
    setNodeFills(
      messageNode,
      DEFAULT_SETTINGS.customization.palette.onBackground.mid
    );
    component.appendChild(messageNode);
    messageNode.layoutSizingHorizontal = 'FILL';

    //caption
    let captionNode = figma.createText();
    captionNode.fontName = { family: 'Inter', style: 'Regular' };
    captionNode.fontSize = 16;
    captionNode.characters = 'Frame caption';
    captionNode.textAlignHorizontal = 'CENTER';
    setNodeFills(
      captionNode,
      DEFAULT_SETTINGS.customization.palette.onBackground.mid
    );
    component.appendChild(captionNode);
    captionNode.layoutSizingHorizontal = 'FILL';
    captionProperty = component.addComponentProperty(
      'caption',
      'TEXT',
      'Frame caption'
    );
    captionNode.componentPropertyReferences = { characters: captionProperty };
    parent.appendChild(component);
  });
  return {
    id: component.id,
    captionProp: captionProperty,
  };
}

export async function generateBrokenLinkInstance(
  caption: string,
  componentVersion: number
): Promise<InstanceNode> {
  let componentData: BaseComponentData = JSON.parse(
    figma.root.getSharedPluginData(FIGMA_NAMESPACE, FIGMA_COMPONENT_DATA_KEY)
  );
  let component: BaseNode;
  await figma
    .getNodeByIdAsync(componentData.components.brokenLink.id)
    .then((node) => {
      component = node;
    });
  if (component.type == 'COMPONENT') {
    let instance = component.createInstance();
    instance.setProperties({
      [componentData.components.brokenLink.captionProp]:
        decodeStringForFigma(caption),
    });

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
