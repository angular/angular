/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {UpdateRecorder} from './update-recorder';

/**
 * Abstraction of the file system that migrations can use to record and apply
 * changes. This is necessary to support virtual file systems as used in the CLI devkit.
 */
export interface FileSystem {
  /**
   * Resolves an absolute path to a unique path in the file system. For example,
   * the devkit tree considers the workspace as disk root in paths.
   */
  resolve(fsFilePath: string): string;
  /** Checks whether a given file exists. */
  exists(fsFilePath: string): boolean;
  /** Gets the contents of the given file. */
  read(fsFilePath: string): string|null;
  /**
   * Creates an update recorder for the given file. Edits can be recorded and
   * committed in batches. Changes are not applied automatically because otherwise
   * migrations would need to re-read files, or account for shifted file contents.
   */
  edit(fsFilePath: string): UpdateRecorder;
  /** Applies all changes which have been recorded in update recorders. */
  commitEdits(): void;
  /** Creates a new file with the given content. */
  create(fsFilePath: string, content: string);
  /** Overwrites an existing file with the given content. */
  overwrite(fsFilePath: string, content: string);
  /** Deletes the given file. */
  delete(fsFilePath: string);
}
