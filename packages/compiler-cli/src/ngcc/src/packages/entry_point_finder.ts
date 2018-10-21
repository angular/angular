/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as path from 'canonical-path';
import * as fs from 'fs';

import {DependencyResolver, SortedEntryPointsInfo} from './dependency_resolver';
import {EntryPoint, getEntryPointInfo} from './entry_point';


export class EntryPointFinder {
  constructor(private resolver: DependencyResolver) {}
  /**
   * Search the given directory, and sub-directories, for Angular package entry points.
   * @param sourceDirectory An absolute path to the directory to search for entry points.
   */
  findEntryPoints(sourceDirectory: string): SortedEntryPointsInfo {
    const unsortedEntryPoints = walkDirectoryForEntryPoints(sourceDirectory);
    return this.resolver.sortEntryPointsByDependency(unsortedEntryPoints);
  }
}

/**
 * Look for entry points that need to be compiled, starting at the source directory.
 * The function will recurse into directories that start with `@...`, e.g. `@angular/...`.
 * @param sourceDirectory An absolute path to the root directory where searching begins.
 */
function walkDirectoryForEntryPoints(sourceDirectory: string): EntryPoint[] {
  const entryPoints: EntryPoint[] = [];
  fs.readdirSync(sourceDirectory)
      // Not interested in hidden files
      .filter(p => !p.startsWith('.'))
      // Ignore node_modules
      .filter(p => p !== 'node_modules')
      // Only interested in directories (and only those that are not symlinks)
      .filter(p => {
        const stat = fs.lstatSync(path.resolve(sourceDirectory, p));
        return stat.isDirectory() && !stat.isSymbolicLink();
      })
      .forEach(p => {
        // Either the directory is a potential package or a namespace containing packages (e.g
        // `@angular`).
        const packagePath = path.join(sourceDirectory, p);
        if (p.startsWith('@')) {
          entryPoints.push(...walkDirectoryForEntryPoints(packagePath));
        } else {
          entryPoints.push(...getEntryPointsForPackage(packagePath));

          // Also check for any nested node_modules in this package
          const nestedNodeModulesPath = path.resolve(packagePath, 'node_modules');
          if (fs.existsSync(nestedNodeModulesPath)) {
            entryPoints.push(...walkDirectoryForEntryPoints(nestedNodeModulesPath));
          }
        }
      });
  return entryPoints;
}

/**
 * Recurse the folder structure looking for all the entry points
 * @param packagePath The absolute path to an npm package that may contain entry points
 * @returns An array of entry points that were discovered.
 */
function getEntryPointsForPackage(packagePath: string): EntryPoint[] {
  const entryPoints: EntryPoint[] = [];

  // Try to get an entry point from the top level package directory
  const topLevelEntryPoint = getEntryPointInfo(packagePath, packagePath);
  if (topLevelEntryPoint !== null) {
    entryPoints.push(topLevelEntryPoint);
  }

  // Now search all the directories of this package for possible entry points
  walkDirectory(packagePath, subdir => {
    const subEntryPoint = getEntryPointInfo(packagePath, subdir);
    if (subEntryPoint !== null) {
      entryPoints.push(subEntryPoint);
    }
  });

  return entryPoints;
}

/**
 * Recursively walk a directory and its sub-directories, applying a given
 * function to each directory.
 * @param dir the directory to recursively walk.
 * @param fn the function to apply to each directory.
 */
function walkDirectory(dir: string, fn: (dir: string) => void) {
  return fs
      .readdirSync(dir)
      // Not interested in hidden files
      .filter(p => !p.startsWith('.'))
      // Ignore node_modules
      .filter(p => p !== 'node_modules')
      // Only interested in directories (and only those that are not symlinks)
      .filter(p => {
        const stat = fs.lstatSync(path.resolve(dir, p));
        return stat.isDirectory() && !stat.isSymbolicLink();
      })
      .forEach(subdir => {
        subdir = path.resolve(dir, subdir);
        fn(subdir);
        walkDirectory(subdir, fn);
      });
}
