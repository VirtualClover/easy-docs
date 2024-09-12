import {
  BaseComponentData,
  FIGMA_COMPONENT_DATA_KEY,
  FIGMA_COMPONENT_PREFIX,
  FIGMA_COMPONENT_VERSION_KEY,
  FIGMA_NAMESPACE,
  Position,
} from '../../constants';

import { DEFAULT_FONT_FAMILIES } from '../../../styles/base';
import { setNodeFills } from '../setNodeFills';
import { setNodeStrokeColor } from '../setNodeStrokeColor';

export async function createPointerComponent(parent: FrameNode) {
  let component: ComponentNode;
  let set: ComponentNode[] = [];
  let componentProperty: string;
  let componentSet: ComponentSetNode;
  let pointerPosPropKey: string = 'pointerPosition';
  await figma
    .loadFontAsync({ family: DEFAULT_FONT_FAMILIES[0], style: 'Semi Bold' })
    .then(() => {
      let tagSize = 20;
      let variants = [
        {
          w: tagSize * 2,
          h: tagSize,
          lr: 0,
          px: 0,
          py: 0,
          pConstraints: { horizontal: 'MIN', vertical: 'CENTER' } as const,
          lx: tagSize,
          ly: tagSize / 2,
          name: 'left',
          lConstraints: { horizontal: 'STRETCH', vertical: 'CENTER' } as const,
        },
        {
          w: tagSize,
          h: tagSize * 2,
          lr: 90,
          px: 0,
          py: 0,
          pConstraints: { horizontal: 'CENTER', vertical: 'MIN' } as const,
          lx: tagSize / 2,
          ly: tagSize * 2,
          name: 'top',
          lConstraints: { horizontal: 'CENTER', vertical: 'STRETCH' } as const,
        },
        {
          w: tagSize * 2,
          h: tagSize,
          lr: 0,
          px: tagSize,
          pConstraints: { horizontal: 'MAX', vertical: 'CENTER' } as const,
          py: 0,
          lx: 0,
          ly: tagSize / 2,
          name: 'right',
          lConstraints: { horizontal: 'STRETCH', vertical: 'CENTER' } as const,
        },
        {
          w: tagSize,
          h: tagSize * 2,
          lr: 90,
          px: 0,
          py: tagSize,
          pConstraints: { horizontal: 'CENTER', vertical: 'MAX' } as const,
          lx: tagSize / 2,
          ly: tagSize,
          name: 'bottom',
          lConstraints: { horizontal: 'CENTER', vertical: 'STRETCH' } as const,
        },
      ];
      for (let i = 0; i < variants.length; i++) {
        let variantData = variants[i];

        //Component
        component = figma.createComponent();
        component.resize(variantData.w, variantData.h);
        component.name = `${pointerPosPropKey}=${variantData.name}`;

        //Tag
        let tag = figma.createFrame();
        tag.layoutMode = 'HORIZONTAL';
        tag.resize(tagSize, tagSize);
        setNodeFills(tag, '#FF0D8F');
        tag.verticalPadding = 8;
        tag.horizontalPadding = 8;
        tag.cornerRadius = 40;
        tag.layoutSizingHorizontal = 'FIXED';
        tag.layoutSizingVertical = 'FIXED';
        tag.counterAxisAlignItems = 'CENTER';
        tag.primaryAxisAlignItems = 'CENTER';
        component.appendChild(tag);
        tag.x = variantData.px;
        tag.y = variantData.py;
        tag.constraints = variantData.pConstraints;

        //tag.layoutSizingHorizontal = 'HUG';

        //Tag caption
        let tagCaption = figma.createText();
        tagCaption.characters = '1';
        setNodeFills(tagCaption, '#FFF');
        tag.appendChild(tagCaption);
        tagCaption.textAutoResize = 'WIDTH_AND_HEIGHT';
        tagCaption.fontSize = 12;
        tagCaption.textAlignVertical = 'CENTER';
        tagCaption.fontName = {
          family: DEFAULT_FONT_FAMILIES[0],
          style: 'Semi Bold',
        };

        // line
        let line = figma.createLine();
        setNodeStrokeColor(line, '#FF0D8F');
        line.resize(tagSize, 0);
        line.x = variantData.lx;
        line.constraints = variantData.lConstraints;
        line.y = variantData.ly;
        line.rotation = variantData.lr;
        component.appendChild(line);

        componentProperty = component.addComponentProperty(
          'index',
          'TEXT',
          '1'
        );
        tagCaption.componentPropertyReferences = {
          characters: componentProperty,
        };

        set.push(component);
      }

      componentSet = figma.combineAsVariants(set, parent);
      componentSet.layoutMode = 'VERTICAL';
      componentSet.itemSpacing = 40;
      componentSet.name = `${FIGMA_COMPONENT_PREFIX}Pointer`;
    });
  return {
    id: componentSet.id,
    contentProp: Object.keys(componentSet.componentPropertyDefinitions)[0],
    pointerPosProp: {
      key: pointerPosPropKey,
      variables:
        componentSet.componentPropertyDefinitions[pointerPosPropKey]
          .variantOptions,
    },
  };
}

export async function generatePointerInstance(
  index: number,
  pointerPosition: Position = 'left',
  componentVersion: number
): Promise<InstanceNode> {
  let componentData: BaseComponentData = JSON.parse(
    figma.root.getSharedPluginData(FIGMA_NAMESPACE, FIGMA_COMPONENT_DATA_KEY)
  );
  let componentSet: BaseNode;

  await figma
    .getNodeByIdAsync(componentData.components.pointer.id)
    .then((node) => {
      componentSet = node;
    })
    .catch((e) => {
      console.error(e);
    });
  if (componentSet.type == 'COMPONENT_SET') {
    let component = componentSet.children[0] as ComponentNode;
    let instance = component.createInstance();
    instance.setProperties({
      [componentData.components.pointer.contentProp]: index.toString(),
      [componentData.components.pointer.pointerPosProp
        .key]: `${pointerPosition}`,
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
