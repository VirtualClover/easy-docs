export type TextAlignment = 'left' | 'right' | ' center';
export type UpperCaseTextAligment = 'LEFT' | 'RIGHT' | 'CENTER';
export type ListOrder = 'unordered' | 'ordered';
export type UpperCaseListOrder = 'UNORDERED' | 'ORDERED';

export const SPEC_VALUE_SOURCES = [
  'raw',
  'figmaStyle',
  'figmaVariable',
  'designToken',
] as const;
export type SpecValueSource = (typeof SPEC_VALUE_SOURCES)[number];

export interface AnatomySpecValue {
  value: number | string | null;
  source: SpecValueSource;
}

export interface PropertyDependant {
  mainComponent: 'string';
}

export interface AnatomySpecs {
  width: AnatomySpecValue;
  height: AnatomySpecValue;
  typography: AnatomySpecValue;
  fontName: AnatomySpecValue;
  fontSize: AnatomySpecValue;
  fontWeight: AnatomySpecValue;
  lineHeight: AnatomySpecValue;
  textDecoration: AnatomySpecValue;
  letterSpacing: AnatomySpecValue;
  fills: AnatomySpecValue;
  minHeight: AnatomySpecValue;
  minWidth: AnatomySpecValue;
  itemSpacing: AnatomySpecValue;
  cornerRadius: AnatomySpecValue;
  topLeftRadius: AnatomySpecValue;
  topRightRadius: AnatomySpecValue;
  bottomLeftRadius: AnatomySpecValue;
  bottomRightRadius: AnatomySpecValue;
  strokeWeight: AnatomySpecValue;
  strokeTopWeight: AnatomySpecValue;
  strokeRightWeight: AnatomySpecValue;
  strokeBottomWeight: AnatomySpecValue;
  strokeLeftWeight: AnatomySpecValue;
  strokes: AnatomySpecValue;
  paddingTop: AnatomySpecValue;
  paddingRight: AnatomySpecValue;
  paddingLeft: AnatomySpecValue;
  paddingBottom: AnatomySpecValue;
}

export interface LayerSpecs {
  name: string;
  type: string;
  specs?: AnatomySpecs;
  mainComponent?: string;
  nodeId: string;
}
