
/**
 * Checks if an object is null
 * @param value 
 * @returns 
 */
export function objectIsNull(value): Boolean {
  for (var key in value) {
    if (value[key] == null || value[key] == undefined) return true;
    if (typeof value[key] === 'object' && Object.keys(value[key]).length === 0)
      return true;
    if (typeof value[key] === 'string' && value[key].trim().length === 0)
      return true;
    if (value[key] instanceof Object) return objectIsNull(value[key]);
  }

  return false;
}
