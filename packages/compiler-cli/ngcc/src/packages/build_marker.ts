/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {resolve} from 'canonical-path';
import {writeFileSync} from 'fs';

import {EntryPoint, EntryPointJsonProperty} from './entry_point';

export const NGCC_VERSION = '0.0.0-PLACEHOLDER';

/**
 * Check whether there is a build marker for the given entry-point and format property.
 * @param entryPoint the entry-point to check for a marker.
 * @param format the property in the package.json of the format for which we are checking for a
 * marker.
 * @returns true if the entry-point and format have already been built with this ngcc version.
 * @throws Error if the entry-point and format have already been built with a different ngcc
 * version.
 */
export function checkMarker(entryPoint: EntryPoint, format: EntryPointJsonProperty): boolean {
  const pkg = entryPoint.packageJson;
  const compiledVersion = pkg.__modified_by_ngcc__ && pkg.__modified_by_ngcc__[format];
  if (compiledVersion && compiledVersion !== NGCC_VERSION) {
    throw new Error(
        'The ngcc compiler has changed since the last ngcc build.\n' +
        'Please completely remove `node_modules` and try again.');
  }
  return !!compiledVersion;
}

/**
 * Write a build marker for the given entry-point and format property, to indicate that it has
 * been compiled by this version of ngcc.
 *
 * @param entryPoint the entry-point to write a marker.
 * @param format the property in the package.json of the format for which we are writing the marker.
 */
export function writeMarker(entryPoint: EntryPoint, format: EntryPointJsonProperty) {
  const pkg = entryPoint.packageJson;
  if (!pkg.__modified_by_ngcc__) pkg.__modified_by_ngcc__ = {};
  pkg.__modified_by_ngcc__[format] = NGCC_VERSION;
  writeFileSync(resolve(entryPoint.path, 'package.json'), JSON.stringify(pkg), 'utf8');
}
