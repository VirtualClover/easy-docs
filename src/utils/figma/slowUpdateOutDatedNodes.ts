import { FIGMA_COMPONENT_VERSION_KEY, FIGMA_NAMESPACE } from '../constants';

import {
  FIGMA_COMPONENT_PREFIX,
} from '../constants';
import { getComponentData } from './getComponentData';
import { scanCurrentSelectionForDocs } from './scans';

export let slowUpdateOutdatedComponentBlocks = async () => {
  let section: SectionNode;
  let componentData = getComponentData();

  scanCurrentSelectionForDocs().then((res) => {
    section = res.section;

    const nodes = section.findAllWithCriteria({
      types: ['INSTANCE'],
    });

    for (let index = 0; index < nodes.length; index++) {
      let instance = nodes[index];
      let instanceName = instance.name.replace(FIGMA_COMPONENT_PREFIX, '');
      let mainCompId: string;
      console.log(instanceName);
      switch (instanceName) {
        case 'Paragraph':
          mainCompId = componentData.components.paragraph.id;
          break;
        case 'Heading':
          console.log('gets here');
          mainCompId = componentData.components.header.id;
          break;
        case 'Quote':
          mainCompId = componentData.components.quote.id;
          break;
        case 'Frame':
          mainCompId = componentData.components.displayFrame.id;
          break;
        case 'DosAndDonts':
          mainCompId = componentData.components.dosAndDonts.id;
          break;
        case 'BrokenLink':
          mainCompId = componentData.components.brokenLink.id;
          break;
        case 'List':
          mainCompId = componentData.components.list.id;
          break;
        case 'TableCell':
          mainCompId = componentData.components.tableCell.id;
          break;
        case 'Alert':
          mainCompId = componentData.components.alert.id;
          break;
        case 'Code':
          mainCompId = componentData.components.code.id;
          break;
          case 'Divider':
          mainCompId = componentData.components.divider.id;
          break;
          case 'Specs':
          mainCompId = componentData.components.componentDoc.id;
          break;
        default:
          break;
      }
      if (mainCompId) {
        figma.getNodeByIdAsync(mainCompId).then((node) => {
          if (node.type == 'COMPONENT') {
            instance.swapComponent(node);
          }
          if (node.type == 'COMPONENT_SET') {
            let parentNode = node;
            instance.getMainComponentAsync().then((oldNode) => {
              let childNode = parentNode.findOne(
                (n) => n.name === oldNode.name
              );
              if (childNode && childNode.type == 'COMPONENT') {
                instance.swapComponent(childNode);
              }
            });
          }

          instance.setSharedPluginData(
            FIGMA_NAMESPACE,
            FIGMA_COMPONENT_VERSION_KEY,
            componentData.lastGenerated.toString()
          );
        });
      }
    }
  });
};
