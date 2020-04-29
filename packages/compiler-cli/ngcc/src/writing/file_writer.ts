
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AbsoluteFsPath} from '../../../src/ngtsc/file_system';
import {EntryPointJsonProperty} from '../packages/entry_point';
import {EntryPointBundle} from '../packages/entry_point_bundle';
import {FileToWrite} from '../rendering/utils';

/**
 * Responsible for writing out the transformed files to disk.
 */
export interface FileWriter {
  writeBundle(
      bundle: EntryPointBundle, transformedFiles: FileToWrite[],
      formatProperties: EntryPointJsonProperty[]): void;

  /**
   * Revert the change to a file written by the same `FileWriter` implementation.
   *
   * @param filePath The original path of a transformed file. (The transformed file maybe written
   *     at the same or a different location, depending on the `FileWriter` implementation.)
   * @param packagePath The path to the package that contains the entry-point including the file.
   */
  revertFile(filePath: AbsoluteFsPath, packagePath: AbsoluteFsPath): void;
}
