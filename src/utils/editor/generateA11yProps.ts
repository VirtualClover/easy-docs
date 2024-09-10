/**
 * Generates A11y properties for a component, mainly used for the document tabs
 * @param index
 * @returns
 */
export function generateA11yProps(index: number) {
  return {
    id: `menu-tab-${index}`,
    'aria-controls': `menu-tabpanel-${index}`,
  };
}
