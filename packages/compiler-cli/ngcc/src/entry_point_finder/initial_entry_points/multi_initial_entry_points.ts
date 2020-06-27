/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AbsoluteFsPath, FileSystem} from '../../../../src/ngtsc/file_system';
import {InitialEntryPoints} from './interface';

/**
 * This implementation of `InitialEntryPoints` will return the list
 * of paths from a text file loaded from the given `entryPointListPath`.
 *
 * The format of the file is a simple JSON array of strings. Each string is a
 * path relative to the given `sourceDirectory`.
 */
export class MultiInitialEntryPoints implements InitialEntryPoints {
  constructor(
      private fs: FileSystem, private sourceDirectory: AbsoluteFsPath,
      private entryPointListPath: AbsoluteFsPath) {}

  getInitialEntryPointPaths(): AbsoluteFsPath[] {
    const entryPointsListFile = this.loadEntryPointListFile();
    return this.parseEntryPointListFile(entryPointsListFile);
  }

  private loadEntryPointListFile(): string {
    try {
      return this.fs.readFile(this.entryPointListPath);
    } catch (e) {
      throw new Error(
          `Failed to load entry-points list file at ${this.entryPointListPath}:\n${e.message}`);
    }
  }

  private parseEntryPointListFile(entryPointsListFile: string): AbsoluteFsPath[] {
    try {
      const entryPoints = JSON.parse(entryPointsListFile) as string[];
      return entryPoints.map(p => this.fs.resolve(this.sourceDirectory, p));
    } catch (e) {
      throw new Error(`Failed to parse entry-points list file from ${
          this.entryPointListPath} as JSON: ${e.message}`);
    }
  }
}
