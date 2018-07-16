/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {readFileSync} from 'fs';
import {dirname, resolve} from 'path';
import {find} from 'shelljs';

/**
 * Match paths to package.json files.
 */
const PACKAGE_JSON_REGEX = /\/package\.json$/;

/**
 * Match paths that have a `node_modules` segment at the start or in the middle.
 */
const NODE_MODULES_REGEX = /(?:^|\/)node_modules\//;

/**
 * Search the `rootDirectory` and its subdirectories to find package.json files.
 * It ignores node dependencies, i.e. those under `node_modules` folders.
 * @param rootDirectory the directory in which we should search.
 */
export function findAllPackageJsonFiles(rootDirectory: string): string[] {
  // TODO(gkalpak): Investigate whether skipping `node_modules/` directories (instead of traversing
  //                them and filtering out the results later) makes a noticeable difference.
  const paths = Array.from(find(rootDirectory));
  return paths.filter(
      path => PACKAGE_JSON_REGEX.test(path) &&
          !NODE_MODULES_REGEX.test(path.slice(rootDirectory.length)));
}

/**
 * Identify the entry points of a package.
 * @param packageDirectory The absolute path to the root directory that contains this package.
 * @param format The format of the entry point within the package.
 * @returns A collection of paths that point to entry points for this package.
 */
export function getEntryPoints(packageDirectory: string, format: string): string[] {
  const packageJsonPaths = findAllPackageJsonFiles(packageDirectory);
  return packageJsonPaths
      .map(packageJsonPath => {
        const entryPointPackageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
        const relativeEntryPointPath = entryPointPackageJson[format];
        return relativeEntryPointPath && resolve(dirname(packageJsonPath), relativeEntryPointPath);
      })
      .filter(entryPointPath => entryPointPath);
}
