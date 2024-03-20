/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {global} from './global';

declare global {
  const ngI18nClosureMode: boolean;
}

/**
 * NOTE: changes to the `ngI18nClosureMode` name must be synced with `compiler-cli/src/tooling.ts`.
 */
if (typeof ngI18nClosureMode === 'undefined') {
  // These property accesses can be ignored because ngI18nClosureMode will be set to false
  // when optimizing code and the whole if statement will be dropped.
  // Make sure to refer to ngI18nClosureMode as ['ngI18nClosureMode'] for closure.
  // NOTE: we need to have it in IIFE so that the tree-shaker is happy.
  (function() {
    // tslint:disable-next-line:no-toplevel-property-access
    global['ngI18nClosureMode'] =
        // TODO(FW-1250): validate that this actually, you know, works.
        // tslint:disable-next-line:no-toplevel-property-access
        typeof goog !== 'undefined' && typeof goog.getMsg === 'function';
  })();
}
