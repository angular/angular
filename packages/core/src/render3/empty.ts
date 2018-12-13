/**
* @license
* Copyright Google Inc. All Rights Reserved.
*
* Use of this source code is governed by an MIT-style license that can be
* found in the LICENSE file at https://angular.io/license
*/

import './ng_dev_mode';

export const EMPTY_OBJ: {} = {};
export const EMPTY_ARRAY: any[] = [];
if (typeof ngDevMode !== 'undefined' && ngDevMode) {
  Object.freeze(EMPTY_OBJ);
  Object.freeze(EMPTY_ARRAY);
}