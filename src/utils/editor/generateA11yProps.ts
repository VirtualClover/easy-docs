export function generateA11yProps(index: number) {
  return {
    id: `menu-tab-${index}`,
    'aria-controls': `menu-tabpanel-${index}`,
  };
}
