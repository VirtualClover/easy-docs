import { CustomizationSettings } from '../utils/constants';
import { addIndentation } from '../utils/general/addIndentation';

export let generateCSSVars = (
  settings: CustomizationSettings,
  oneLine = false
) => {
  let vars = [];
  vars.push(`
/*Font*/
:root {--ed-theme-font-family: ${settings.fontFamily};}
/*Base palette*/
:root {
  --ed-theme-primary: ${settings.palette.primary};
  --ed-theme-secondary: ${settings.palette.secondary};
  --ed-theme-background-default: ${settings.palette.background.default};
  --ed-theme-background-tonal-low: ${settings.palette.background.tonal_low};
  --ed-theme-background-tonal-high: ${settings.palette.background.tonal_high};
  --ed-theme-surface: ${settings.palette.surface};
  --ed-theme-error-default: ${settings.palette.status.error.default};
  --ed-theme-error-muted: ${settings.palette.status.error.muted};
  --ed-theme-error-content: ${settings.palette.status.error.content};
  --ed-theme-warning-default: ${settings.palette.status.warning.default};
  --ed-theme-warning-muted: ${settings.palette.status.warning.muted};
  --ed-theme-warning-content: ${settings.palette.status.warning.content};
  --ed-theme-info-default: ${settings.palette.status.info.default};
  --ed-theme-info-muted: ${settings.palette.status.info.muted};
  --ed-theme-info-content: ${settings.palette.status.info.content};
  --ed-theme-success-default: ${settings.palette.status.success.default};
  --ed-theme-success-muted: ${settings.palette.status.success.muted};
  --ed-theme-success-content: ${settings.palette.status.success.content};
  --ed-theme-on-primary: ${settings.palette.onPrimary};
  --ed-theme-on-secondary: ${settings.palette.onSecondary};
  --ed-theme-divider-simple: ${settings.palette.divider.simple};
  --ed-theme-on-background-high: ${settings.palette.onBackground.high};
  --ed-theme-on-background-mid: ${settings.palette.onBackground.mid};
  --ed-theme-on-background-low: ${settings.palette.onBackground.low};
  --ed-theme-on-background-link: ${settings.palette.onBackground.link};
}

/*Dark palette*/
@media (prefers-color-scheme: dark) {
  :root {
  --ed-theme-primary: ${settings.paletteDark.primary};
  --ed-theme-secondary: ${settings.paletteDark.secondary};
  --ed-theme-background-default: ${settings.paletteDark.background.default};
  --ed-theme-background-tonal-low: ${settings.paletteDark.background.tonal_low};
  --ed-theme-background-tonal-high: ${settings.paletteDark.background.tonal_high};
  --ed-theme-surface: ${settings.paletteDark.surface};
  --ed-theme-error-default: ${settings.paletteDark.status.error.default};
  --ed-theme-error-muted: ${settings.paletteDark.status.error.muted};
  --ed-theme-error-content: ${settings.paletteDark.status.error.content};
  --ed-theme-warning-default: ${settings.paletteDark.status.warning.default};
  --ed-theme-warning-muted: ${settings.paletteDark.status.warning.muted};
  --ed-theme-warning-content: ${settings.paletteDark.status.warning.content};
  --ed-theme-info-default: ${settings.paletteDark.status.info.default};
  --ed-theme-info-muted: ${settings.paletteDark.status.info.muted};
  --ed-theme-info-content: ${settings.paletteDark.status.info.content};
  --ed-theme-success-default: ${settings.paletteDark.status.success.default};
  --ed-theme-success-muted: ${settings.paletteDark.status.success.muted};
  --ed-theme-success-content: ${settings.paletteDark.status.success.content};
  --ed-theme-on-primary: ${settings.paletteDark.onPrimary};
  --ed-theme-on-secondary: ${settings.paletteDark.onSecondary};
  --ed-theme-divider-simple: ${settings.paletteDark.divider.simple};
  --ed-theme-on-background-high: ${settings.paletteDark.onBackground.high};
  --ed-theme-on-background-mid: ${settings.paletteDark.onBackground.mid};
  --ed-theme-on-background-low: ${settings.paletteDark.onBackground.low};
  --ed-theme-on-background-link: ${settings.paletteDark.onBackground.link};
  }
}
`);
  let response = vars.join('');
  if (oneLine) {
    response = response.replace(/(\r\n|\n|\r)/gm, '');
  }
  return response;
};

export let generateBaseCSSDocumentStyles = () => {
  let styles = [];
  styles.push(
    `body {font-family: var(--ed-theme-font-family); color: var(--ed-theme-on-background-mid); margin: 0; background-color:var(--ed-theme-background-default);}`
  );
  styles.push(`.ed-document-page-content {max-width:800px; margin: 0 auto;padding:8px; overflow:auto;}`);
  styles.push(
    `h1, h2, h3, h4, h5, h6, h7, h8, h9, h10 {font-weight: 700; color: var(--ed-theme-on-background-high);}`
  );
  styles.push(`a:visited {color: var(--ed-theme-on-background-link);}`);
  styles.push(
    `.ed-h2{font-size: 1.8em;}.ed-h3{font-size: 1.6em;}.ed-h4{font-size: 1.4em;}.ed-h5{font-size: 1.2em;}.ed-h6{font-size: 1em;}`
  );
  styles.push(`a:link{color: var(--ed-theme-on-background-link);}`);
  styles.push(`hr{border: 1px solid var(--ed-theme-divider-simple);}`);
  styles.push(
    `pre{background-color: var(--ed-theme-surface); color:var(--ed-theme-on-background-high); border-radius:16px; overflow:auto;}`
  );
  styles.push(`.ed-figma-frame{margin: 16px 0 48px 0;}`);
  styles.push(`.ed-figma-frame figcaption{margin-top: 16px;}`);
  styles.push(
    `table {width:100%; border-radius: 30px; border-style: hidden; box-shadow: 0 0 0 1px var(--ed-theme-divider-simple); border-radius:8px; border-collapse: collapse; margin: 32px 0;}`
  );
  styles.push(
    `th, td {border: 1px solid var(--ed-theme-divider-simple); padding:8px;}`
  );
  styles.push(
    `th {font-weight: 700; color: var(--ed-theme-on-background-high); background-color: var(--ed-theme-background-tonal-high); text-align:left;}`
  );
  styles.push(`.ed-p {word-break: auto-phrase;};`);
  styles.push(
    `.ed-quote {background: var(--ed-theme-surface); margin: 16px 0; padding: 8px 8px 8px 16px; border-left: 12px solid var(--ed-theme-divider-simple); border-radius: 8px;}`
  );
  styles.push(
    `blockquote {margin: 8px 0; font-style: italic; font-size: 18px; color: var(--ed-theme-on-background-high);}`
  );
  styles.push(`.ed-quote figcaption{color: var(--ed-theme-on-background-mid)}`);
  styles.push(
    `tr:nth-of-type(odd) {background-color: var(--ed-theme-background-tonal-low);}`
  );
  styles.push(
    `.ed-alert {padding: 16px 8px 16px 16px; border-radius: 8px; border-left:12px solid;}`
  );
  styles.push(`.ed-alert-icon{margin-right:8px;}`);
  styles.push(
    `.ed-alert-warning {background: var(--ed-theme-warning-muted); color: var(--ed-theme-warning-content); border-color: var(--ed-theme-warning-default);}`
  );
  styles.push(
    `.ed-alert-info {background: var(--ed-theme-info-muted); color: var(--ed-theme-info-content); border-color: var(--ed-theme-info-default);}`
  );
  styles.push(
    `.ed-alert-success {background: var(--ed-theme-success-muted); color: var(--ed-theme-success-content); border-color: var(--ed-theme-success-default)}`
  );
  styles.push(
    `.ed-alert-danger {background: var(--ed-theme-error-muted); color: var(--ed-theme-error-content); border-color: var(--ed-theme-error-default)}`
  );
  styles.push(`.ed-text-center {text-align: center;}`);
  styles.push(`.ed-text-left {text-align: left;}`);
  styles.push(`.ed-text-right {text-align: right;}`);

  return styles.join('');
};

export let generateBaseCSSDocSiteStyles = () => {
  let styles = [];

  styles.push(`:root {
    --mdc-ripple-hover-opacity: .1;
    --mdc-ripple-activated-opacity: .2;
    --mdc-ripple-color: var(--ed-theme-primary);
    --mdc-theme-primary: var(--ed-theme-primary);
    --mdc-theme-secondary: var(--ed-theme-secondary);
    --mdc-theme-background: var(--ed-theme-background-default);
    --mdc-theme-surface: var(--ed-theme-surface);
    --mdc-theme-error: var(--ed-theme-error-muted);
  }`);

  styles.push(`body {
    font-family: var(--ed-theme-font-family);
    color: var(--ed-theme-on-background-mid);
    background-color: var(--ed-theme-background-default);
    padding: 0;
    margin: 0;
    height: 100vh;
    display: flex;
    flex-direction: column;
  }`);

  styles.push(`a:link{color: var(--ed-theme-on-background-link);}`);
  styles.push(`a:visited{color: var(--ed-theme-on-background-link);}`);

  styles.push(`.ed-page-content {
    display: flex;
    height: 100%;
    overflow: hidden;
  }`);

  styles.push(`main {
    flex: 1;
    margin: 0 auto;
    height: 100%;
    overflow: auto;
  }`);

  styles.push(` .ed-tabs-wrapper {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    border-bottom: 1px solid var(--ed-theme-divider-simple);
  }`);
  styles.push(`.ed-tabs-wrapper .mdc-tab-bar {max-width: 800px;}`);
  styles.push(
    `.mdc-tab .mdc-tab__text-label{color: var(--ed-theme-on-background-high);}`
  );
  styles.push(
    `.mdc-tab--active .mdc-tab__text-label{color: var(--ed-theme-on-background-link);}`
  );
  styles.push(`.ed-doc-header {border-bottom: 1px solid var(--ed-theme-divider-simple); padding: 8px;}`);
  styles.push(`.ed-doc-header-content {max-width: 800px;margin: 24px auto; width:100%;}`);
  styles.push(`.ed-iframe-wrapper {width: 100%;border: none;height: 100%;}`);
  styles.push(
    `.mdc-drawer {font-family: var(--ed-theme-font-family);height: 100%; border-color:var(--ed-theme-divider-simple);}`
  );
  styles.push(
    `hr.mdc-deprecated-list-divider {border-bottom-color: var(--ed-theme-divider-simple);}`
  );
  styles.push(
    `.mdc-drawer .mdc-deprecated-list-item{color: var(--ed-theme-on-background-high);}`
  );
  styles.push(
    `span.mdc-deprecated-list-item__text {font-family: var(--ed-theme-font-family);}`
  );
  styles.push(
    `.mdc-drawer h6.mdc-deprecated-list-group__subheader {font-family: var(--ed-theme-font-family);color: var(--ed-theme-on-background-mid);}`
  );
  styles.push(`.mdc-top-app-bar {
    background-color: var(--ed-theme-background);
    border-bottom: 1px solid var(--ed-theme-divider-simple);
    color: var(--ed-theme-on-background-high);
    position: relative;
  }`);
  styles.push(`.mdc-drawer .mdc-deprecated-list-item--activated {font-weight: bold;}`);
  styles.push(`  :not(.mdc-deprecated-list-item--disabled).mdc-deprecated-list-item--activated
    .mdc-deprecated-list-item__ripple::before,
  :not(.mdc-deprecated-list-item--disabled).mdc-deprecated-list-item--activated
    .mdc-deprecated-list-item__ripple::before,
  :not(.mdc-deprecated-list-item--disabled).mdc-deprecated-list-item--activated
    .mdc-deprecated-list-item__ripple::after {
    background-color: var(--ed-theme-primary);
  }`);
  styles.push(`
  h1,
  h2,
  h3,
  h4,
  h5,
  h6,
  h7,
  h8,
  h9,
  h10 {
  font-weight: 700;
  color: var(--ed-theme-on-background-high);
  }
    `);

  return styles.join('').replace(/(\r\n|\n|\r)/gm, '');
};

export let generateInlineStyles = (
  settings: CustomizationSettings,
  identation: number = 0,
  stylesToAdd: string = ''
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
  styles.push(generateCSSVars(settings, true));
  styles.push(generateBaseCSSDocumentStyles());
  styles.push(`.ed-doc-body{max-width: 800px;margin: 0 auto;}`)
  styles.push('</style> \n');

  return styles.join('');
};
