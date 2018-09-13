/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {resolve} from 'canonical-path';
import {existsSync, readFileSync, writeFileSync} from 'fs';
import {EntryPoint, EntryPointFormat} from './entry_point';

export const NGCC_VERSION = '0.0.0-PLACEHOLDER';

function getMarkerPath(entryPointPath: string, format: EntryPointFormat) {
  return resolve(entryPointPath, `__modified_by_ngcc_for_${format}__`);
}

/**
 * Check whether there is a build marker for the given entry point and format.
 * @param entryPoint the entry point to check for a marker.
 * @param format the format for which we are checking for a marker.
 */
export function checkMarkerFile(entryPoint: EntryPoint, format: EntryPointFormat): boolean {
  const markerPath = getMarkerPath(entryPoint.path, format);
  const markerExists = existsSync(markerPath);
  if (markerExists) {
    const previousVersion = readFileSync(markerPath, 'utf8');
    if (previousVersion !== NGCC_VERSION) {
      throw new Error(
          'The ngcc compiler has changed since the last ngcc build.\n' +
          'Please completely remove `node_modules` and try again.');
    }
  }
  return markerExists;
}

export function writeMarkerFile(entryPoint: EntryPoint, format: EntryPointFormat) {
  const markerPath = getMarkerPath(entryPoint.path, format);
  writeFileSync(markerPath, NGCC_VERSION, 'utf8');
}
