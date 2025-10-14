/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {SIGNAL} from '../../../primitives/signals';
/**
 * Checks if the given `value` is a reactive `Signal`.
 *
 * @publicApi 17.0
 */
export function isSignal(value) {
  return typeof value === 'function' && value[SIGNAL] !== undefined;
}
//# sourceMappingURL=api.js.map
