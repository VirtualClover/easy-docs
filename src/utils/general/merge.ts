/**
 * Merges two objects
 * @param obj1 This object's keys will be overwritten by obj2 key's of the same name
 * @param obj2
 * @returns
 */
export function merge(obj1: Object, obj2: Object) {
  return {
    ...obj1,
    obj2,
  };
}
