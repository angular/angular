/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AbsoluteFsPath, FileSystem, PathSegment} from '../../../src/ngtsc/file_system';
import {ModuleResolver} from './module_resolver';

export interface DependencyHost {
  findDependencies(entryPointPath: AbsoluteFsPath): DependencyInfo;
}

export interface DependencyInfo {
  dependencies: Set<AbsoluteFsPath>;
  missing: Set<AbsoluteFsPath|PathSegment>;
  deepImports: Set<AbsoluteFsPath>;
}

export abstract class DependencyHostBase implements DependencyHost {
  constructor(protected fs: FileSystem, protected moduleResolver: ModuleResolver) {}

  /**
   * Find all the dependencies for the entry-point at the given path.
   *
   * @param entryPointPath The absolute path to the JavaScript file that represents an entry-point.
   * @returns Information about the dependencies of the entry-point, including those that were
   * missing or deep imports into other entry-points.
   */
  findDependencies(entryPointPath: AbsoluteFsPath): DependencyInfo {
    const dependencies = new Set<AbsoluteFsPath>();
    const missing = new Set<AbsoluteFsPath|PathSegment>();
    const deepImports = new Set<AbsoluteFsPath>();
    const alreadySeen = new Set<AbsoluteFsPath>();

    this.recursivelyFindDependencies(
        entryPointPath, dependencies, missing, deepImports, alreadySeen);
    return {dependencies, missing, deepImports};
  }

  /**
   * Compute the dependencies of the given file.
   *
   * @param file An absolute path to the file whose dependencies we want to get.
   * @param dependencies A set that will have the absolute paths of resolved entry points added to
   * it.
   * @param missing A set that will have the dependencies that could not be found added to it.
   * @param deepImports A set that will have the import paths that exist but cannot be mapped to
   * entry-points, i.e. deep-imports.
   * @param alreadySeen A set that is used to track internal dependencies to prevent getting stuck
   * in a circular dependency loop.
   */
  protected abstract recursivelyFindDependencies(
      file: AbsoluteFsPath, dependencies: Set<AbsoluteFsPath>, missing: Set<string>,
      deepImports: Set<AbsoluteFsPath>, alreadySeen: Set<AbsoluteFsPath>): void;
}
