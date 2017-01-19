/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
interface VinylFile extends Object {
  // Absolute path to the virtual file
  path: string;

  // Content of the virtual file
  contents: Buffer;
}
;

export default VinylFile;