
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {AbsoluteFsPath} from '../../../src/ngtsc/file_system';
import {EntryPoint, EntryPointJsonProperty} from '../packages/entry_point';
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
   * Revert the changes to an entry-point processed for the specified format-properties by the same
   * `FileWriter` implementation.
   *
   * @param entryPoint The entry-point to revert.
   * @param transformedFilePaths The original paths of the transformed files. (The transformed files
   *     may be written at the same or a different location, depending on the `FileWriter`
   *     implementation.)
   * @param formatProperties The format-properties pointing to the entry-point.
   */
  revertBundle(
      entryPoint: EntryPoint, transformedFilePaths: AbsoluteFsPath[],
      formatProperties: EntryPointJsonProperty[]): void;
}
