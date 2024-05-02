import { BaseFileData } from '../../constants';

export function generateQuoteInstance(data): InstanceNode {
  let componentData: BaseFileData = JSON.parse(
    figma.root.getSharedPluginData('EasyDocs', 'components')
  );
  let component = figma.getNodeById(componentData.quote.id);
  if (component.type == 'COMPONENT') {
    let instance = component.createInstance();
    instance.setProperties({
      [componentData.quote.contentProp]: data.text.replace('&nbsp;', ' '),
    });
    instance.setProperties({
      [componentData.quote.authorProp]: data.caption.replace('&nbsp;', ' '),
    });
    return instance;
    //instance.set
  }
  return null;
}
