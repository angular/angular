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
 * Check whether ngcc has already processed a given entry-point format.
 *
 * The entry-point is defined by the package.json contents provided.
 * The format is defined by the provided property name of the path to the bundle in the package.json
 *
 * @param packageJson The parsed contents of the package.json file for the entry-point.
 * @param format The entry-point format property in the package.json to check.
 * @returns true if the entry-point and format have already been processed with this ngcc version.
 * @throws Error if the `packageJson` property is not an object.
 * @throws Error if the entry-point has already been processed with a different ngcc version.
 */
export function hasBeenProcessed(packageJson: any, format: string): boolean {
  if (typeof packageJson !== 'object') {
    throw new Error('`packageJson` parameter is invalid. It parameter must be an object.');
  }
  if (!packageJson.__modified_by_ngcc__) {
    return false;
  }
  if (Object.keys(packageJson.__modified_by_ngcc__)
          .some(property => packageJson.__modified_by_ngcc__[property] !== NGCC_VERSION)) {
    throw new Error(
        'The ngcc compiler has changed since the last ngcc build.\n' +
        'Please completely remove `node_modules` and try again.');
  }

  return packageJson.__modified_by_ngcc__[format] === NGCC_VERSION;
}

/**
 * Check whether there is a marker for the given entry-point and format property, indicating that
 * the given bundle has already been processed.
 * @param entryPoint the entry-point to check for a marker.
 * @param format the property in the package.json of the format for which we are checking for a
 * marker.
 * @returns true if the entry-point and format have already been processed with this ngcc version.
 * @throws Error if the entry-point and format have already been processed with a different ngcc
 * version.
 */
export function checkMarker(entryPoint: EntryPoint, format: EntryPointJsonProperty): boolean {
  const pkg = entryPoint.packageJson;
  return hasBeenProcessed(pkg, format);
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
