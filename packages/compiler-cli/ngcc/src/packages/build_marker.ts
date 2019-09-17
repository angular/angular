/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AbsoluteFsPath, basename, dirname, isRoot} from '../../../src/ngtsc/file_system';
import {PackageJsonUpdater} from '../writing/package_json_updater';
import {EntryPointPackageJson, PackageJsonFormatProperties} from './entry_point';

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
    packageJson: EntryPointPackageJson, format: PackageJsonFormatProperties,
    entryPointPath: AbsoluteFsPath): boolean {
  if (!packageJson.__processed_by_ivy_ngcc__) {
    return false;
  }
  if (Object.keys(packageJson.__processed_by_ivy_ngcc__)
          .some(property => packageJson.__processed_by_ivy_ngcc__ ![property] !== NGCC_VERSION)) {
    let nodeModulesFolderPath = entryPointPath;
    while (!isRoot(nodeModulesFolderPath) && basename(nodeModulesFolderPath) !== 'node_modules') {
      nodeModulesFolderPath = dirname(nodeModulesFolderPath);
    }
    throw new Error(
        `The ngcc compiler has changed since the last ngcc build.\n` +
        `Please remove "${isRoot(nodeModulesFolderPath) ? entryPointPath : nodeModulesFolderPath}" and try again.`);
  }

  return packageJson.__processed_by_ivy_ngcc__[format] === NGCC_VERSION;
}

/**
 * Write a build marker for the given entry-point and format properties, to indicate that they have
 * been compiled by this version of ngcc.
 *
 * @param pkgJsonUpdater The writer to use for updating `package.json`.
 * @param packageJson The parsed contents of the `package.json` file for the entry-point.
 * @param packageJsonPath The absolute path to the `package.json` file.
 * @param properties The properties in the `package.json` of the formats for which we are writing
 *                   the marker.
 */
export function markAsProcessed(
    pkgJsonUpdater: PackageJsonUpdater, packageJson: EntryPointPackageJson,
    packageJsonPath: AbsoluteFsPath, formatProperties: PackageJsonFormatProperties[]): void {
  const update = pkgJsonUpdater.createUpdate();

  // Update the format properties to mark them as processed.
  for (const prop of formatProperties) {
    update.addChange(['__processed_by_ivy_ngcc__', prop], NGCC_VERSION);
  }

  // Update the `prepublishOnly` script (keeping a backup, if necessary) to prevent `ngcc`'d
  // packages from getting accidentally published.
  const oldPrepublishOnly = packageJson.scripts && packageJson.scripts.prepublishOnly;
  const newPrepublishOnly = 'node --eval \"console.error(\'' +
      'ERROR: Trying to publish a package that has been compiled by NGCC. This is not allowed.\\n' +
      'Please delete and rebuild the package, without compiling with NGCC, before attempting to publish.\\n' +
      'Note that NGCC may have been run by importing this package into another project that is being built with Ivy enabled.\\n' +
      '\')\" ' +
      '&& exit 1';

  if (oldPrepublishOnly && (oldPrepublishOnly !== newPrepublishOnly)) {
    update.addChange(['scripts', 'prepublishOnly__ivy_ngcc_bak'], oldPrepublishOnly);
  }

  update.addChange(['scripts', 'prepublishOnly'], newPrepublishOnly);

  update.writeChanges(packageJsonPath, packageJson);
}
