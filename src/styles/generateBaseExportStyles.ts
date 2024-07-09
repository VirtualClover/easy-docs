import { ColorPalette } from './base';
import { addIndentation } from '../utils/general/addIndentation';

export let generateBaseExportStyles = (
  baseFontFamily: string,
  basePalette: ColorPalette,
  identation: number = 0
): string => {
  let styles: string[] = [];
  styles.push(
    `${addIndentation(
      identation
    )}<link rel="preconnect" href="https://fonts.googleapis.com">\n${addIndentation(
      identation
    )}<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n${addIndentation(
      identation
    )}<link href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap" rel="stylesheet">\n`
  );
  styles.push(`${addIndentation(identation)}<style>`);
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
    `pre{background-color: ${basePalette.surface}; color:${basePalette.onSurface.high}; border-radius:16px; overflow:auto;}`
  );
  styles.push(`.ed-figma-frame{margin: 16px 0 48px 0;}`);
  styles.push(`.ed-figma-frame figcaption{margin-top: 16px;}`);
  styles.push(
    `table {width:100%; border-radius: 30px; border-style: hidden; box-shadow: 0 0 0 1px ${basePalette.divider.simple}; border-radius:8px; border-collapse: collapse; margin: 32px 0;}`
  );
  styles.push(
    `th, td {border: 1px solid ${basePalette.divider.simple}; padding:8px;}`
  );
  styles.push(
    `th {font-weight: 700; color: ${basePalette.onBackground.high}; background-color: ${basePalette.background.tonal_high}; text-align:left;}`
  );
  styles.push(
    `.ed-quote {background: ${basePalette.surface}; margin: 16px 0; padding: 8px 8px 8px 16px; border-left: 12px solid ${basePalette.divider.simple}; border-radius: 8px;}`
  );
  styles.push(
    `blockquote {margin: 8px 0; font-style: italic; font-size: 18px; color: ${basePalette.onSurface.high};}`
  );
  styles.push(`.ed-quote figcaption{color:${basePalette.onSurface.mid}}`);
  styles.push(
    `tr:nth-of-type(odd) {background-color: ${basePalette.background.tonal_low};}`
  );
  styles.push(
    `.ed-alert {padding: 16px 8px 16px 16px; border-radius: 8px; border-left:12px solid;}`
  );
  styles.push(`.ed-alert-icon{margin-right:8px;}`);
  styles.push(
    `.ed-alert-warning {background: ${basePalette.status.warning.muted}; color: ${basePalette.status.warning.content}; border-color: ${basePalette.status.warning.default};}`
  );
  styles.push(
    `.ed-alert-info {background: ${basePalette.status.info.muted}; color: ${basePalette.status.info.content}; border-color: ${basePalette.status.info.default};}`
  );
  styles.push(
    `.ed-alert-success {background: ${basePalette.status.success.muted}; color: ${basePalette.status.success.content}; border-color: ${basePalette.status.success.default}}`
  );
  styles.push(
    `.ed-alert-danger {background: ${basePalette.status.error.muted}; color: ${basePalette.status.error.content}; border-color: ${basePalette.status.error.default}}`
  );
  styles.push(`.ed-text-center {text-align: center;}`);
  styles.push(`.ed-text-left {text-align: left;}`);
  styles.push(`.ed-text-right {text-align: right;}`);
  styles.push('</style>');

  return styles.join('');
};
