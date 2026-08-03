/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {privatelyTracked as privatelyTrackedPrimitive} from '../../../primitives/signals';

/**
 * Execute an arbitrary function in a reactive context where signal dependencies are marked as privately tracked.
 * @see [Reading without tracking dependencies](guide/signals)
 */
export function privatelyTracked<T>(fn: () => T): T {
  return privatelyTrackedPrimitive(fn);
}
