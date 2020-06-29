/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AbsoluteFsPath} from '../../../src/ngtsc/file_system';
import {NGCC_PROPERTY_EXTENSION} from '../writing/new_entry_point_file_writer';
import {PackageJsonUpdater} from '../writing/package_json_updater';
import {EntryPointPackageJson, PackageJsonFormatProperties} from './entry_point';

export const NGCC_VERSION = '0.0.0-PLACEHOLDER';

/**
 * Returns true if there is a format in this entry-point that was compiled with an outdated version
 * of ngcc.
 *
 * @param packageJson The parsed contents of the package.json for the entry-point
 */
export function needsCleaning(packageJson: EntryPointPackageJson): boolean {
  return Object.values(packageJson.__processed_by_ivy_ngcc__ || {})
      .some(value => value !== NGCC_VERSION);
}

/**
 * Clean any build marker artifacts from the given `packageJson` object.
 * @param packageJson The parsed contents of the package.json to modify
 * @returns true if the package was modified during cleaning
 */
export function cleanPackageJson(packageJson: EntryPointPackageJson): boolean {
  if (packageJson.__processed_by_ivy_ngcc__ !== undefined) {
    // Remove the actual marker
    delete packageJson.__processed_by_ivy_ngcc__;
    // Remove new format properties that have been added by ngcc
    for (const prop of Object.keys(packageJson)) {
      if (prop.endsWith(NGCC_PROPERTY_EXTENSION)) {
        delete packageJson[prop];
      }
    }

    // Also remove the prebulish script if we modified it
    const scripts = packageJson.scripts;
    if (scripts !== undefined && scripts.prepublishOnly) {
      delete scripts.prepublishOnly;
      if (scripts.prepublishOnly__ivy_ngcc_bak !== undefined) {
        scripts.prepublishOnly = scripts.prepublishOnly__ivy_ngcc_bak;
        delete scripts.prepublishOnly__ivy_ngcc_bak;
      }
    }
    return true;
  }
  return false;
}

/**
 * Check whether ngcc has already processed a given entry-point format.
 *
 * @param packageJson The parsed contents of the package.json file for the entry-point.
 * @param format The entry-point format property in the package.json to check.
 * @returns true if the `format` in the entry-point has already been processed by this ngcc version,
 * false otherwise.
 */
export function hasBeenProcessed(
    packageJson: EntryPointPackageJson, format: PackageJsonFormatProperties): boolean {
  return packageJson.__processed_by_ivy_ngcc__ !== undefined &&
      packageJson.__processed_by_ivy_ngcc__[format] === NGCC_VERSION;
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
    update.addChange(['__processed_by_ivy_ngcc__', prop], NGCC_VERSION, 'alphabetic');
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
