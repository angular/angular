/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {setPrivateTracking} from './graph';

/**
 * Execute an arbitrary function in a reactive context where signal dependencies are marked as privately tracked.
 */
export function privatelyTracked<T>(fn: () => T): T {
  const prev = setPrivateTracking(true);
  try {
    return fn();
  } finally {
    setPrivateTracking(prev);
  }
}
