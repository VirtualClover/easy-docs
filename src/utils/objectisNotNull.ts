export function objectIsNotNull(value) {
  if (Array.isArray(value)) return value.every(objectIsNotNull);
  if (!value && typeof value === 'object')
    return Object.values(value).every(objectIsNotNull);
  return value === null || value === undefined;
}
