/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AbsoluteFsPath, FileSystem, ReadonlyFileSystem} from '../../../../src/ngtsc/file_system';
import {needsCleaning} from '../../packages/build_marker';
import {EntryPoint} from '../../packages/entry_point';

import {BackupFileCleaner, CleaningStrategy, NgccDirectoryCleaner, PackageJsonCleaner} from './cleaning_strategies';
import {isLocalDirectory} from './utils';

/**
 * A class that can clean ngcc artifacts from a directory.
 */
export class PackageCleaner {
  constructor(private fs: ReadonlyFileSystem, private cleaners: CleaningStrategy[]) {}

  /**
   * Recurse through the file-system cleaning files and directories as determined by the configured
   * cleaning-strategies.
   *
   * @param directory the current directory to clean
   */
  clean(directory: AbsoluteFsPath) {
    const basenames = this.fs.readdir(directory);
    for (const basename of basenames) {
      if (basename === 'node_modules') {
        continue;
      }

      const path = this.fs.resolve(directory, basename);
      for (const cleaner of this.cleaners) {
        if (cleaner.canClean(path, basename)) {
          cleaner.clean(path, basename);
          break;
        }
      }
      // Recurse into subdirectories (note that a cleaner may have removed this path)
      if (isLocalDirectory(this.fs, path)) {
        this.clean(path);
      }
    }
  }
}


/**
 * Iterate through the given `entryPoints` identifying the package for each that has at least one
 * outdated processed format, then cleaning those packages.
 *
 * Note that we have to clean entire packages because there is no clear file-system boundary
 * between entry-points within a package. So if one entry-point is outdated we have to clean
 * everything within that package.
 *
 * @param fileSystem the current file-system
 * @param entryPoints the entry-points that have been collected for this run of ngcc
 * @returns true if packages needed to be cleaned.
 */
export function cleanOutdatedPackages(fileSystem: FileSystem, entryPoints: EntryPoint[]): boolean {
  const packagesToClean = new Set<AbsoluteFsPath>();
  for (const entryPoint of entryPoints) {
    if (needsCleaning(entryPoint.packageJson)) {
      packagesToClean.add(entryPoint.packagePath);
    }
  }

  const cleaner = new PackageCleaner(fileSystem, [
    new PackageJsonCleaner(fileSystem),
    new NgccDirectoryCleaner(fileSystem),
    new BackupFileCleaner(fileSystem),
  ]);
  for (const packagePath of packagesToClean) {
    cleaner.clean(packagePath);
  }

  return packagesToClean.size > 0;
}
