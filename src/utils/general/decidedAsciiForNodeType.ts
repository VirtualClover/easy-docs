export let decidedAsciiForNodeType = (nodeType: string): string => {
  switch (nodeType) {
    case 'Main Component':
      return '❖';
    case 'INSTANCE':
      return '◇';
    case 'FRAME':
      return '□';
    case 'TEXT':
      return 'Tₜ';
    default:
      return '';
  }
};
