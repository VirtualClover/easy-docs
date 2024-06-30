import { BASE_COMPONENT_DATA, BaseComponentData } from '../constants/constants';
import { FIGMA_COMPONENT_DATA_KEY, FIGMA_NAMESPACE } from '../constants';

export let getComponentData = (): BaseComponentData => {
  let stringComponentData = figma.root.getSharedPluginData(
    FIGMA_NAMESPACE,
    FIGMA_COMPONENT_DATA_KEY
  );

  return stringComponentData
    ? JSON.parse(stringComponentData)
    : BASE_COMPONENT_DATA;
};
