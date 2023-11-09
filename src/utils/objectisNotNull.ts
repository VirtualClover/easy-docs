export function objectIsNotNull(value) {
  const nulls = Object.values(value).filter((p) => p === '' || p === null);
  return nulls.length === 0;
}
