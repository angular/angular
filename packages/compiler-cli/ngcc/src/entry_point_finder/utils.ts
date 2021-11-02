/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AbsoluteFsPath, getFileSystem, PathManipulation, ReadonlyFileSystem} from '../../../src/ngtsc/file_system';
import {Logger} from '../../../src/ngtsc/logging';
import {PathMappings} from '../path_mappings';

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
    const baseUrl = fs.resolve(pathMappings.baseUrl);
    if (fs.isRoot(baseUrl)) {
      logger.warn(
          `The provided pathMappings baseUrl is the root path ${baseUrl}.\n` +
          `This is likely to mess up how ngcc finds entry-points and is probably not correct.\n` +
          `Please check your path mappings configuration such as in the tsconfig.json file.`);
    }
    for (const paths of Object.values(pathMappings.paths)) {
      for (const path of paths) {
        let foundMatch = false;

        // We only want base paths that exist and are not files
        const {prefix, hasWildcard} = extractPathPrefix(path);
        let basePath = fs.resolve(baseUrl, prefix);
        if (fs.exists(basePath) && fs.stat(basePath).isFile()) {
          basePath = fs.dirname(basePath);
        }

        if (fs.exists(basePath)) {
          // The `basePath` is itself a directory
          basePaths.push(basePath);
          foundMatch = true;
        }

        if (hasWildcard) {
          // The path contains a wildcard (`*`) so also try searching for directories that start
          // with the wildcard prefix path segment.
          const wildcardContainer = fs.dirname(basePath);
          const wildcardPrefix = fs.basename(basePath);
          if (isExistingDirectory(fs, wildcardContainer)) {
            const candidates = fs.readdir(wildcardContainer);
            for (const candidate of candidates) {
              if (candidate.startsWith(wildcardPrefix)) {
                const candidatePath = fs.resolve(wildcardContainer, candidate);
                if (isExistingDirectory(fs, candidatePath)) {
                  foundMatch = true;
                  basePaths.push(candidatePath);
                }
              }
            }
          }
        }

        if (!foundMatch) {
          // We neither found a direct match (i.e. `basePath` is an existing directory) nor a
          // directory that starts with a wildcard prefix.
          logger.debug(
              `The basePath "${basePath}" computed from baseUrl "${baseUrl}" and path mapping "${
                  path}" does not exist in the file-system.\n` +
              `It will not be scanned for entry-points.`);
        }
      }
    }
  }

  const dedupedBasePaths = dedupePaths(fs, basePaths);

  // We want to ensure that the `sourceDirectory` is included when it is a node_modules folder.
  // Otherwise our entry-point finding algorithm would fail to walk that folder.
  if (fs.basename(sourceDirectory) === 'node_modules' &&
      !dedupedBasePaths.includes(sourceDirectory)) {
    dedupedBasePaths.unshift(sourceDirectory);
  }

  return dedupedBasePaths;
}

function isExistingDirectory(fs: ReadonlyFileSystem, path: AbsoluteFsPath): boolean {
  return fs.exists(path) && fs.stat(path).isDirectory();
}

/**
 * Extract everything in the `path` up to the first `*`.
 * @param path The path to parse.
 * @returns The extracted prefix and a flag to indicate whether there was a wildcard `*`.
 */
function extractPathPrefix(path: string): {prefix: string, hasWildcard: boolean} {
  const [prefix, rest] = path.split('*', 2);
  return {prefix, hasWildcard: rest !== undefined};
}

/**
 * Run a task and track how long it takes.
 *
 * @param task The task whose duration we are tracking.
 * @param log The function to call with the duration of the task.
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

/**
 * Remove paths that are contained by other paths.
 *
 * For example:
 * Given `['a/b/c', 'a/b/x', 'a/b', 'd/e', 'd/f']` we will end up with `['a/b', 'd/e', 'd/f]`.
 * (Note that we do not get `d` even though `d/e` and `d/f` share a base directory, since `d` is not
 * one of the base paths.)
 */
function dedupePaths(fs: PathManipulation, paths: AbsoluteFsPath[]): AbsoluteFsPath[] {
  const root: Node = {children: new Map()};
  for (const path of paths) {
    addPath(fs, root, path);
  }
  return flattenTree(root);
}

/**
 * Add a path (defined by the `segments`) to the current `node` in the tree.
 */
function addPath(fs: PathManipulation, root: Node, path: AbsoluteFsPath): void {
  let node = root;
  if (!fs.isRoot(path)) {
    const segments = path.split('/');
    for (let index = 0; index < segments.length; index++) {
      if (isLeaf(node)) {
        // We hit a leaf so don't bother processing any more of the path
        return;
      }
      // This is not the end of the path continue to process the rest of this path.
      const next = segments[index];
      if (!node.children.has(next)) {
        node.children.set(next, {children: new Map()});
      }
      node = node.children.get(next)!;
    }
  }
  // This path has finished so convert this node to a leaf
  convertToLeaf(node, path);
}

/**
 * Flatten the tree of nodes back into an array of absolute paths.
 */
function flattenTree(root: Node): AbsoluteFsPath[] {
  const paths: AbsoluteFsPath[] = [];
  const nodes: Node[] = [root];
  for (let index = 0; index < nodes.length; index++) {
    const node = nodes[index];
    if (isLeaf(node)) {
      // We found a leaf so store the currentPath
      paths.push(node.path);
    } else {
      node.children.forEach(value => nodes.push(value));
    }
  }
  return paths;
}

function isLeaf(node: Node): node is Leaf {
  return node.path !== undefined;
}

function convertToLeaf(node: Node, path: AbsoluteFsPath) {
  node.path = path;
}

interface Node {
  children: Map<string, Node>;
  path?: AbsoluteFsPath;
}

type Leaf = Required<Node>;
