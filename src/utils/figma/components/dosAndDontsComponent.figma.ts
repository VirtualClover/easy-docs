import {
  DEFAULT_GUIDELINES,
  DEFAULT_HEADING_SIZES,
  DEFAULT_SETTINGS,
  FIGMA_COMPONENT_PREFIX,
  GuidelineType,
} from '../../constants';

import { BaseFileData } from '../../constants';
import { decodeStringForFigma } from '../../cleanseTextData';
import { setNodeFills } from '../setNodeFills';

export async function createDosAndDontsComponent(
  parent: FrameNode,
  guidelineTypes = DEFAULT_GUIDELINES
) {
  let set: ComponentNode[] = [];
  let componentSet: ComponentSetNode;
  let captionProperty: string;
  let sourceProperty: string;
  let guidelinePropKey: string = 'type';
  await figma
    .loadFontAsync({ family: 'Inter', style: 'Medium Italic' })
    .then(() => {
      for (let i = 0; i < guidelineTypes.length; i++) {
        const currentGuideline = guidelineTypes[i];
        let component = figma.createComponent();
        //Component
        component = figma.createComponent();
        component.resizeWithoutConstraints(100, 1);
        component.layoutMode = 'VERTICAL';
        component.primaryAxisSizingMode = 'AUTO';
        component.itemSpacing = 16;
        component.name = `${guidelinePropKey}=${currentGuideline}`;

        //Source
        let sourceWrapper = figma.createFrame();
        sourceWrapper.layoutMode = 'VERTICAL';
        sourceWrapper.verticalPadding = 8;
        sourceWrapper.horizontalPadding = 8;
        setNodeFills(
          sourceWrapper,
          DEFAULT_SETTINGS.customization.palette.divider.simple
        );
        sourceWrapper.bottomLeftRadius = 16;
        sourceWrapper.bottomRightRadius = 16;
        component.appendChild(sourceWrapper);
        sourceWrapper.layoutSizingHorizontal = 'FILL';
        let sourceNode = figma.createText();
        sourceNode.fontName = { family: 'Inter', style: 'Medium Italic' };
        sourceNode.fontSize = 12;
        sourceNode.characters = 'Source here';
        setNodeFills(
          sourceNode,
          DEFAULT_SETTINGS.customization.palette.onBackground.mid
        );
        sourceWrapper.appendChild(sourceNode);
        sourceNode.layoutSizingHorizontal = 'FILL';
        sourceProperty = component.addComponentProperty(
          'url',
          'TEXT',
          'Source here'
        );
        sourceNode.componentPropertyReferences = { characters: sourceProperty };

        //caption
        let captionNode = figma.createText();
        captionNode.fontName = { family: 'Inter', style: 'Regular' };
        captionNode.fontSize = 16;
        captionNode.characters = 'Frame caption';
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
        captionNode.componentPropertyReferences = {
          characters: captionProperty,
        };
        parent.appendChild(component);
        set.push(component);
      }

      componentSet = figma.combineAsVariants(set, parent);
      componentSet.layoutMode = 'VERTICAL';
      componentSet.itemSpacing = 90;
      componentSet.name = `${FIGMA_COMPONENT_PREFIX}DosAndDonts`;
    });
  //console.log(componentSet.componentPropertyDefinitions);
  return {
    id: componentSet.id,
    contentProp: Object.keys(componentSet.componentPropertyDefinitions)[0],
    levelProp: {
      key: guidelinePropKey,
      variables:
        componentSet.componentPropertyDefinitions[guidelinePropKey]
          .variantOptions,
    },
  };
}

export async function generateHeaderInstance(data): Promise<InstanceNode> {
  let componentData: BaseFileData = JSON.parse(
    figma.root.getSharedPluginData('EasyDocs', 'components')
  );
  let componentSet: BaseNode;
  await figma
    .getNodeByIdAsync(componentData.header.id)
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
      [componentData.header.contentProp]: decodeStringForFigma(data.text),
      [componentData.header.levelProp.key]: `${data.level}`,
    });
    return instance;
    //instance.set
  }

  return null;
}
