/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * From where the content for a source file or source-map came.
 *
 * - Source files can be linked to source-maps by:
 *   - providing the content inline via a base64 encoded data comment,
 *   - providing a URL to the file path in a comment,
 *   - the loader inferring the source-map path from the source file path.
 * - Source-maps can link to source files by:
 *   - providing the content inline in the `sourcesContent` property
 *   - providing the path to the file in the `sources` property
 */
export enum ContentOrigin {
  /**
   * The contents were provided programmatically when calling `loadSourceFile()`.
   */
  Provided,
  /**
   * The contents were extracted directly form the contents of the referring file.
   */
  Inline,
  /**
   * The contents were loaded from the file-system, after being explicitly referenced or inferred
   * from the referring file.
   */
  FileSystem,
}
