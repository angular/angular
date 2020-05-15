/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {UpdateRecorder} from './update-recorder';

/**
 * A workspace path semantically is equivalent to the `Path` type provided by the
 * Angular devkit. Paths denoted with such a type are guaranteed to be representing
 * paths of a given virtual file system. This means that the root of a path can be
 * different, and does not necessarily need to match the root in the real file system.
 *
 * For example: Consider we have a project in `/home/<..>/my-project`. Then a path
 * like `/package.json` could actually refer to the `package.json` file in `my-project`.
 * Note that in the real file system this would not match though.
 *
 * One wonder why another type has been declared for such paths, when there already
 * is the `Path` type provided by the devkit. We do this for a couple of reasons:
 *
 *   1. The update-tool cannot have a dependency on the Angular devkit as that one
 *      is not synced into g3. We want to be able to run migrations in g3 if needed.
 *   2. `WorkspacePath` is stricter than `Path` because it does not intersect with `string`.
 *      That helps ensuring that workspace paths are not accidentally passed to native
 *      path manipulation functions (like `path.resolve`). This complicates the use of
 *      workspace paths, but it's a trade off for more predictable path manipulations.
 */
export type WorkspacePath = {
  // Brand signature matches the devkit paths so that existing path
  // utilities from the Angular devkit can be conveniently used.
  __PRIVATE_DEVKIT_PATH: void;
};

/**
 * Abstraction of the file system that migrations can use to record and apply
 * changes. This is necessary to support virtual file systems as used in the CLI devkit.
 */
export abstract class FileSystem<T = WorkspacePath> {
  /** Checks whether a given file exists. */
  abstract exists(filePath: T): boolean;
  /** Gets the contents of the given file. */
  abstract read(filePath: T): string|null;
  /**
   * Creates an update recorder for the given file. Edits can be recorded and
   * committed in batches. Changes are not applied automatically because otherwise
   * migrations would need to re-read files, or account for shifted file contents.
   */
  abstract edit(filePath: T): UpdateRecorder;
  /** Applies all changes which have been recorded in update recorders. */
  abstract commitEdits(): void;
  /** Creates a new file with the given content. */
  abstract create(filePath: T, content: string);
  /** Overwrites an existing file with the given content. */
  abstract overwrite(filePath: T, content: string);
  /** Deletes the given file. */
  abstract delete(filePath: T);
  /**
   * Resolves given paths to a resolved path in the file system. For example, the devkit
   * tree considers the actual workspace directory as file system root.
   *
   * Follows the same semantics as the native path `resolve` method. i.e. segments
   * are processed in reverse. The last segment is considered the target and the
   * function will iterate from the target through other segments until it finds an
   * absolute path segment.
   */
  abstract resolve(...segments: string[]): T;
}
