/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AbsoluteFsPath, getFileSystem, relative, resolve} from '../../../src/ngtsc/file_system';
import {Logger} from '../logging/logger';
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
    logger: Logger, sourceDirectory: AbsoluteFsPath,
    pathMappings: PathMappings|undefined): AbsoluteFsPath[] {
  const fs = getFileSystem();
  const basePaths = [sourceDirectory];
  if (pathMappings) {
    const baseUrl = resolve(pathMappings.baseUrl);
    if (fs.isRoot(baseUrl)) {
      logger.warn(
          `The provided pathMappings baseUrl is the root path ${baseUrl}.\n` +
          `This is likely to mess up how ngcc finds entry-points and is probably not correct.\n` +
          `Please check your path mappings configuration such as in the tsconfig.json file.`);
    }
    Object.values(pathMappings.paths).forEach(paths => paths.forEach(path => {
      // We only want base paths that exist and are not files
      let basePath = fs.resolve(baseUrl, extractPathPrefix(path));
      if (fs.exists(basePath) && fs.stat(basePath).isFile()) {
        basePath = fs.dirname(basePath);
      }
      if (fs.exists(basePath)) {
        basePaths.push(basePath);
      } else {
        logger.warn(
            `The basePath "${basePath}" computed from baseUrl "${baseUrl}" and path mapping "${
                path}" does not exist in the file-system.\n` +
            `It will not be scanned for entry-points.`);
      }
    }));
  }
  basePaths.sort().reverse();  // Get the paths in order with the longer ones first.
  const dedupedBasePaths = basePaths.filter(removeContainedPaths);

  // We want to ensure that the `sourceDirectory` is included when it is a node_modules folder.
  // Otherwise our entry-point finding algorithm would fail to walk that folder.
  if (fs.basename(sourceDirectory) === 'node_modules' &&
      !dedupedBasePaths.includes(sourceDirectory)) {
    dedupedBasePaths.unshift(sourceDirectory);
  }

  return dedupedBasePaths;
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
 * A filter function that removes paths that are contained by other paths.
 *
 * For example:
 * Given `['a/b/c', 'a/b/x', 'a/b', 'd/e', 'd/f']` we will end up with `['a/b', 'd/e', 'd/f]`.
 * (Note that we do not get `d` even though `d/e` and `d/f` share a base directory, since `d` is not
 * one of the base paths.)
 *
 * @param value The current path.
 * @param index The index of the current path.
 * @param array The array of paths (sorted in reverse alphabetical order).
 * @returns true if this path is not contained by another path.
 */
function removeContainedPaths(value: AbsoluteFsPath, index: number, array: AbsoluteFsPath[]) {
  // We only need to check the following paths since the `array` is sorted in reverse alphabetic
  // order.
  for (let i = index + 1; i < array.length; i++) {
    // We need to use `relative().startsWith()` rather than a simple `startsWith()` to ensure we
    // don't assume that `a/b` contains `a/b-2`.
    if (!relative(array[i], value).startsWith('..')) return false;
  }
  return true;
}

/**
 * Run a task and track how long it takes.
 *
 * @param task The task whose duration we are tracking
 * @param log The function to call with the duration of the task
 * @returns The result of calling `task`.
 */
export function trackDuration<T = void>(task: () => T extends Promise<unknown>? never : T,
                                                              log: (duration: number) => void): T {
  const startTime = Date.now();
  const result = task();
  const duration = Math.round((Date.now() - startTime) / 100) / 10;
  log(duration);
  return result;
}
