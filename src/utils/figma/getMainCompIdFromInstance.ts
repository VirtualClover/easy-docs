/**
 * Returns the component ID of a given an instance, if the component is part of a component set, this will return the component set ID instead
 * @param instance - An instance node
 * @returns - The ID of a component node or a component set node
 */
export let getMainCompIdFromInstance = async (instance: InstanceNode) => {
  let mainCompId: string = '';
  await instance.getMainComponentAsync().then((component) => {
    mainCompId =
      component.parent.type == 'COMPONENT_SET'
        ? component.parent.id
        : component.id;
  });
  return mainCompId;
};
