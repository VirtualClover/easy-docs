export const DEFAULT_STATUSES = [
  'info',
  'success',
  'warning',
  'danger',
] as const;
export type StatusType = (typeof DEFAULT_STATUSES)[number];

export const DEFAULT_GUIDELINES = ['do', 'dont', 'caution'] as const;
export type GuidelineType = (typeof DEFAULT_GUIDELINES)[number];
