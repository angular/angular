/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AbsoluteFsPath, getFileSystem, isRoot, resolve} from '../../../src/ngtsc/file_system';
import {Logger} from '../../../src/ngtsc/logging';

import {PathMappings} from '../path_mappings';

export class BasePaths {
  private basePaths = new Map<AbsoluteFsPath, AbsoluteFsPath[]>();

  constructor(private logger: Logger) {}

  /**
   * Parse the path-mappings to compute the base-paths that need to be considered when finding
   * entry-points.
   *
   * This processing can be time-consuming if the path-mappings are complex or extensive.
   * So the result is cached locally once computed.
   */
  getBasePaths(sourceDirectory: AbsoluteFsPath, pathMappings: PathMappings|undefined):
      AbsoluteFsPath[] {
    if (this.basePaths.has(sourceDirectory)) {
      return this.basePaths.get(sourceDirectory)!;
    }

    const basePaths = this.computeBasePaths(sourceDirectory, pathMappings);
    this.basePaths.set(sourceDirectory, basePaths);
    return basePaths;
  }

  /**
   * Extract all the base-paths that we need to search for entry-points.
   *
   * This always contains the standard base-path (`mainBasePath`).
   * But it also parses the `paths` mappings object to guess additional base-paths.
   *
   * For example:
   *
   * ```
   * const pathMappings = {
   *    baseUrl: '/dist',
   *    paths: {'*': ['lib/*', 'lib/generated/*']}
   * };
   * basePaths.getBasePaths('/node_modules', pathMappings);
   *
   * > ['/node_modules', '/dist/lib']
   * ```
   *
   * Notice that `'/dist'` is not included as there is no `'*'` path,
   * and `'/dist/lib/generated'` is not included as it is covered by `'/dist/lib'`.
   *
   * @param sourceDirectory The standard root directory to include as a base-path (e.g.
   *     node_modules).
   */
  private computeBasePaths(sourceDirectory: AbsoluteFsPath, pathMappings: PathMappings|undefined):
      AbsoluteFsPath[] {
    const fs = getFileSystem();
    const basePaths = [sourceDirectory];
    if (pathMappings) {
      const baseUrl = resolve(pathMappings.baseUrl);
      if (fs.isRoot(baseUrl)) {
        this.logger.warn(
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
          this.logger.debug(
              `The basePath "${basePath}" computed from baseUrl "${baseUrl}" and path mapping "${
                  path}" does not exist in the file-system.\n` +
              `It will not be scanned for entry-points.`);
        }
      }));
    }

    const dedupedBasePaths = dedupePaths(basePaths);

    // We want to ensure that the `sourceDirectory` is included when it is a node_modules folder.
    // Otherwise our entry-point finding algorithm would fail to walk that folder.
    if (fs.basename(sourceDirectory) === 'node_modules' &&
        !dedupedBasePaths.includes(sourceDirectory)) {
      dedupedBasePaths.unshift(sourceDirectory);
    }

    return dedupedBasePaths;
  }
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
 * Remove paths that are contained by other paths.
 *
 * For example:
 * Given `['a/b/c', 'a/b/x', 'a/b', 'd/e', 'd/f']` we will end up with `['a/b', 'd/e', 'd/f]`.
 * (Note that we do not get `d` even though `d/e` and `d/f` share a base directory, since `d` is not
 * one of the base paths.)
 */
function dedupePaths(paths: AbsoluteFsPath[]): AbsoluteFsPath[] {
  const root: Node = {children: new Map()};
  for (const path of paths) {
    addPath(root, path);
  }
  return flattenTree(root);
}

/**
 * Add a path (defined by the `segments`) to the current `node` in the tree.
 */
function addPath(root: Node, path: AbsoluteFsPath): void {
  let node = root;
  if (!isRoot(path)) {
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
