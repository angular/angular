/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AbsoluteFsPath, FileSystem, PathSegment} from '../../../src/ngtsc/file_system';
import {EntryPoint} from '../packages/entry_point';
import {resolveFileWithPostfixes} from '../utils';

import {ModuleResolver} from './module_resolver';

export interface DependencyHost {
  collectDependencies(
      entryPointPath: AbsoluteFsPath, {dependencies, missing, deepImports}: DependencyInfo): void;
}

export interface DependencyInfo {
  dependencies: Set<AbsoluteFsPath>;
  missing: Set<AbsoluteFsPath|PathSegment>;
  deepImports: Set<AbsoluteFsPath>;
}

export interface EntryPointWithDependencies {
  entryPoint: EntryPoint;
  depInfo: DependencyInfo;
}

export function createDependencyInfo(): DependencyInfo {
  return {dependencies: new Set(), missing: new Set(), deepImports: new Set()};
}

export abstract class DependencyHostBase implements DependencyHost {
  constructor(protected fs: FileSystem, protected moduleResolver: ModuleResolver) {}

  /**
   * Find all the dependencies for the entry-point at the given path.
   *
   * @param entryPointPath The absolute path to the JavaScript file that represents an entry-point.
   * @param dependencyInfo An object containing information about the dependencies of the
   * entry-point, including those that were missing or deep imports into other entry-points. The
   * sets in this object will be updated with new information about the entry-point's dependencies.
   */
  collectDependencies(
      entryPointPath: AbsoluteFsPath, {dependencies, missing, deepImports}: DependencyInfo): void {
    const resolvedFile =
        resolveFileWithPostfixes(this.fs, entryPointPath, this.moduleResolver.relativeExtensions);
    if (resolvedFile !== null) {
      const alreadySeen = new Set<AbsoluteFsPath>();
      this.recursivelyCollectDependencies(
          resolvedFile, dependencies, missing, deepImports, alreadySeen);
    }
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
  protected abstract recursivelyCollectDependencies(
      file: AbsoluteFsPath, dependencies: Set<AbsoluteFsPath>, missing: Set<string>,
      deepImports: Set<AbsoluteFsPath>, alreadySeen: Set<AbsoluteFsPath>): void;
}
