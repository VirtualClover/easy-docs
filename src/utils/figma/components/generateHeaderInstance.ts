import { BaseFileData } from '../../constants';

export function generateHeaderInstance(data: string) {
  let componentIDs: BaseFileData = JSON.parse(
    figma.root.getSharedPluginData('EasyDocs', 'components')
  );
  let componentSet = figma.getNodeById(componentIDs.header.id);
  if (componentSet.type == 'COMPONENT_SET') {
    let component = componentSet.children[0] as ComponentNode;
    let instance = component.createInstance();
    return instance;
    //instance.set
  }
  return null;
}
