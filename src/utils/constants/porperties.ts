export type TextAlignment = 'left' | 'right' | ' center';
export type UpperCaseTextAligment = 'LEFT' | 'RIGHT' | 'CENTER';
export type ListOrder = 'unordered' | 'ordered';
export type UpperCaseListOrder = 'UNORDERED' | 'ORDERED';

export interface AnatomyProperties {
    width: number | null,
    height: number | null,
    fills: string | null,
    minHeight: number |null,
    minWidth: number |null,
    itemSpacing: number | 'auto' | null,
    cornerRadius: number | null,
    topLeftRadius: number | null,
    topRightRadius: number | null,
    bottomLeftRadius: number | null,
    bottomRightRadius: number | null,
    strokeWeight: number | null,
    strokeTopWeight: number | null,
    strokeRightWeight: number | null,
    strokeBottomWeight: number | null,
    strokeLeftWeight: number | null,
    strokes: string | null,
    paddingTop: number | null,
    paddingRight: number | null,
    paddingLeft: number | null,
    paddingBottom: number | null,
  };