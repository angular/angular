/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

declare namespace base64js {
  function fromByteArray(arr: Uint8Array): string;
  function toByteArray(str: string): Uint8Array;
}

export = base64js;
