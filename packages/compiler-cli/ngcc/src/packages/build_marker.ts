/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AbsoluteFsPath, FileSystem, dirname} from '../../../src/ngtsc/file_system';
import {EntryPointJsonProperty, EntryPointPackageJson} from './entry_point';

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
export function hasBeenProcessed(
    packageJson: EntryPointPackageJson, format: EntryPointJsonProperty): boolean {
  if (!packageJson.__processed_by_ivy_ngcc__) {
    return false;
  }
  if (Object.keys(packageJson.__processed_by_ivy_ngcc__)
          .some(property => packageJson.__processed_by_ivy_ngcc__ ![property] !== NGCC_VERSION)) {
    throw new Error(
        'The ngcc compiler has changed since the last ngcc build.\n' +
        'Please completely remove `node_modules` and try again.');
  }

  return packageJson.__processed_by_ivy_ngcc__[format] === NGCC_VERSION;
}

/**
 * Write a build marker for the given entry-point and format property, to indicate that it has
 * been compiled by this version of ngcc.
 *
 * @param entryPoint the entry-point to write a marker.
 * @param format the property in the package.json of the format for which we are writing the marker.
 */
export function markAsProcessed(
    fs: FileSystem, packageJson: EntryPointPackageJson, packageJsonPath: AbsoluteFsPath,
    format: EntryPointJsonProperty) {
  if (!packageJson.__processed_by_ivy_ngcc__) packageJson.__processed_by_ivy_ngcc__ = {};
  packageJson.__processed_by_ivy_ngcc__[format] = NGCC_VERSION;
  // Just in case this package.json was synthesized due to a custom configuration
  // we will ensure that the path to the containing folder exists before we write the file.
  fs.ensureDir(dirname(packageJsonPath));
  fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
}
