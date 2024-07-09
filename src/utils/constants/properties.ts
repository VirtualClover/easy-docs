export type TextAlignment = 'left' | 'right' | ' center';
export type UpperCaseTextAligment = 'LEFT' | 'RIGHT' | 'CENTER';
export type ListOrder = 'unordered' | 'ordered';
export type UpperCaseListOrder = 'UNORDERED' | 'ORDERED';

export const PROPERTY_SOURCES = [
  'raw',
  'figmaStyle',
  'figmaVariable',
  'designToken',
] as const;
export type PropertySource = (typeof PROPERTY_SOURCES)[number];

export interface AnatomyProperty {
  value: number | string | null;
  source: PropertySource;
}

export interface PropertyDependant {
  mainComponent: 'string';
} 

export interface AnatomyProperties {
  width: AnatomyProperty;
  height: AnatomyProperty;
  typography: AnatomyProperty;
  fontName: AnatomyProperty;
  fontSize: AnatomyProperty;
  fontWeight: AnatomyProperty;
  lineHeight: AnatomyProperty;
  textDecoration: AnatomyProperty;
  letterSpacing: AnatomyProperty;
  fills: AnatomyProperty;
  minHeight: AnatomyProperty;
  minWidth: AnatomyProperty;
  itemSpacing: AnatomyProperty;
  cornerRadius: AnatomyProperty;
  topLeftRadius: AnatomyProperty;
  topRightRadius: AnatomyProperty;
  bottomLeftRadius: AnatomyProperty;
  bottomRightRadius: AnatomyProperty;
  strokeWeight: AnatomyProperty;
  strokeTopWeight: AnatomyProperty;
  strokeRightWeight: AnatomyProperty;
  strokeBottomWeight: AnatomyProperty;
  strokeLeftWeight: AnatomyProperty;
  strokes: AnatomyProperty;
  paddingTop: AnatomyProperty;
  paddingRight: AnatomyProperty;
  paddingLeft: AnatomyProperty;
  paddingBottom: AnatomyProperty;
}
