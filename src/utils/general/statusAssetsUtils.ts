import { GuidelineType, StatusType } from '../constants/constants';
export const mapDosAndDontsToStatus = (type: GuidelineType): string => {
  switch (type) {
    case 'do':
      return 'success';
      break;
    case 'dont':
      return 'error';
      break;
    case 'caution':
      return 'warning';
      break;
    default:
      return 'success';
      break;
  }
};

export const decideEmojiBasedOnDosAndDonts = (type: GuidelineType): string => {
  switch (type) {
    case 'do':
      return '✅';
      break;
    case 'dont':
      return '❌';
      break;
    case 'caution':
      return '⚠';
      break;
    default:
      return '✅';
      break;
  }
};

export const decideEmojiBasedOnStatus = (type: StatusType): string => {
  switch (type) {
    case 'success':
      return '✅';
      break;
    case 'danger':
      return '❌';
      break;
    case 'warning':
      return '⚠';
      break;
    case 'info':
      return 'ℹ';
      break;
    default:
      return 'ℹ';
      break;
  }
};
