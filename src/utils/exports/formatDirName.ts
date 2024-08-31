import { formatStringToFileName } from '../general/formatStringToFileName';

/**
 * Check if the current folder name has been used in the directory (using a stirng array as a directory list), if it has been used, the function appends a number(loops however many times necessaryif the number appended also has been used); if it has not been used the it returns the name and pushes the name into the array
 * @param folderNamesUsed
 * @param folderName
 * @returns The foldername iterated or not
 */
export let formatDirName = (dirName: string, dirNamesUsed?: string[]): string => {
  let ogFormattedDirName = formatStringToFileName(dirName);
  let formattedDirName = ogFormattedDirName;
  if (dirNamesUsed) {
    let tries = 1;
    while (dirNamesUsed.includes(formattedDirName)) {
      formattedDirName = ogFormattedDirName + `_${tries}`;
      tries++;
    }
    dirNamesUsed.push(formattedDirName);
  }
  return formattedDirName;
};
