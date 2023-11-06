/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {TUTORIALS_FOLDER_NAME} from './constants.mjs';

export const enum DocumentType {
  DOCS,
  TUTORIAL,
}

let currentParsedPath: string | null = null;
let currentParsedDocumentType: DocumentType = DocumentType.DOCS;
const headerIds = new Map<string, number>();

export const setCurrentParsedFilePath = (path: string) => {
  currentParsedPath = path;
  setCurrentParsedDocumentType(
    path.startsWith(TUTORIALS_FOLDER_NAME) ? DocumentType.TUTORIAL : DocumentType.DOCS,
  );
};

export const getCurrentParsedFilePath = (): string | null => currentParsedPath;

export const setCurrentParsedDocumentType = (type: DocumentType) => {
  currentParsedDocumentType = type;
};

export const getCurrentParsedDocumentType = (): DocumentType => currentParsedDocumentType;

export const getHeaderId = (id: string): string => {
  const numberOfHeaderOccurrencesInTheDocument = headerIds.get(id) ?? 0;
  headerIds.set(id, numberOfHeaderOccurrencesInTheDocument + 1);

  const cleanedUpId = id
    .toLowerCase()
    .replaceAll(/<code>(.*?)<\/code>/g, '$1') // remove <code>
    .replaceAll(/<strong>(.*?)<\/strong>/g, '$1') // remove <strong>
    .replaceAll(/<em>(.*?)<\/em>/g, '$1') // remove <em>
    .replace(/\s|\//g, '-') // remove spaces and slashes
    .replace(/gt;|lt;/g, '') // remove escaped < and >
    .replace(/&#\d+;/g, '') // remove HTML entities
    .replace(/[^0-9a-zA-Z\-]/g, ''); // only keep letters, digits & dashes

  const headerId = numberOfHeaderOccurrencesInTheDocument
    ? `${cleanedUpId}-${numberOfHeaderOccurrencesInTheDocument}`
    : cleanedUpId;

  return headerId;
};

export const resetHeaderIdsOfCurrentDocument = (): void => {
  headerIds.clear();
};
