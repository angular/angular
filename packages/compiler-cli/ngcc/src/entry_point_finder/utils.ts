/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AbsoluteFsPath, getFileSystem, join, resolve} from '../../../src/ngtsc/file_system';
import {PathMappings} from '../utils';

/**
 * Extract all the base-paths that we need to search for entry-points.
 *
 * This always contains the standard base-path (`sourceDirectory`).
 * But it also parses the `paths` mappings object to guess additional base-paths.
 *
 * For example:
 *
 * ```
 * getBasePaths('/node_modules', {baseUrl: '/dist', paths: {'*': ['lib/*', 'lib/generated/*']}})
 * > ['/node_modules', '/dist/lib']
 * ```
 *
 * Notice that `'/dist'` is not included as there is no `'*'` path,
 * and `'/dist/lib/generated'` is not included as it is covered by `'/dist/lib'`.
 *
 * @param sourceDirectory The standard base-path (e.g. node_modules).
 * @param pathMappings Path mapping configuration, from which to extract additional base-paths.
 */
export function getBasePaths(
    sourceDirectory: AbsoluteFsPath, pathMappings: PathMappings | undefined): AbsoluteFsPath[] {
  const fs = getFileSystem();
  let basePaths = [sourceDirectory];
  if (pathMappings) {
    const baseUrl = resolve(pathMappings.baseUrl);
    Object.values(pathMappings.paths).forEach(paths => paths.forEach(path => {
      // We only want base paths that exist and are not files
      let basePath = join(baseUrl, extractPathPrefix(path));
      while (basePath !== baseUrl && (!fs.exists(basePath) || fs.stat(basePath).isFile())) {
        basePath = fs.dirname(basePath);
      }
      basePaths.push(basePath);
    }));
  }
  basePaths.sort();  // Get the paths in order with the shorter ones first.
  return basePaths.filter(removeDeeperPaths);
}

/**
 * Extract everything in the `path` up to the first `*`.
 * @param path The path to parse.
 * @returns The extracted prefix.
 */
function extractPathPrefix(path: string) {
  return path.split('*', 1)[0];
}

/**
 * A filter function that removes paths that are already covered by higher paths.
 *
 * @param value The current path.
 * @param index The index of the current path.
 * @param array The array of paths (sorted alphabetically).
 * @returns true if this path is not already covered by a previous path.
 */
function removeDeeperPaths(value: AbsoluteFsPath, index: number, array: AbsoluteFsPath[]) {
  for (let i = 0; i < index; i++) {
    if (value.startsWith(array[i])) return false;
  }
  return true;
}
