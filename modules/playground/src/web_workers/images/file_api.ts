/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

var _FileReader = FileReader;
export {_FileReader as FileReader};

export class Uint8ArrayWrapper {
  static create(buffer: ArrayBuffer) { return new Uint8Array(buffer); }
}
