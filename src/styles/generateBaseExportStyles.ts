import { BASE_STYLE_TOKENS, ColorPalette } from './base';

export let generateBaseExportStyles = (
  baseFontFamily: string,
  basePalette: ColorPalette
): string => {
  let styles: string[] = [];
  styles.push('<style>');
  styles.push(
    `body {font-family: ${baseFontFamily}; color: ${basePalette.onBackground.mid}; padding:8px; margin: 0;}`
  );
  styles.push(`main {max-width:800px; margin: 0 auto;}`);
  styles.push(
    `h1, h2, h3, h4, h5, h6, h7, h8, h9, h10 {font-weight: 700; color: ${basePalette.onBackground.high};}`
  );
  styles.push(`a{color: ${basePalette.onBackground.link};}`);
  styles.push(`hr{border: 1px solid ${basePalette.divider.simple};}`);
  styles.push(
    `pre{background-color: ${basePalette.surface}; color:${basePalette.onSurface.high}; border-radius:16px;}`
  );
  styles.push(`.ed-figma-frame{margin:0;}`);
  styles.push(`table {width:100%; border-radius: 30px; border-style: hidden; box-shadow: 0 0 0 1px ${basePalette.divider.simple}; border-radius:8px; border-collapse: collapse;}`);
  styles.push(`th, td {border: 1px solid ${basePalette.divider.simple}; padding:8px;}`);
  styles.push(
    `th {font-weight: 700; color: ${basePalette.onBackground.high}; background-color: ${basePalette.background.tonal_high}; text-align:left;}`
  );
  styles.push(
    `tr:nth-of-type(odd) {background-color: ${basePalette.background.tonal_low};}`
  );
  styles.push('</style>');

  return styles.join('');
};
