/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {setActiveConsumer} from './graph';

/**
 * Execute an arbitrary function in a non-reactive (non-tracking) context. The executed function
 * can, optionally, return a value.
 *
 * @developerPreview
 */
export function untracked<T>(nonReactiveReadsFn: () => T): T {
  const prevConsumer = setActiveConsumer(null);
  // We are not trying to catch any particular errors here, just making sure that the consumers
  // stack is restored in case of errors.
  try {
    return nonReactiveReadsFn();
  } finally {
    setActiveConsumer(prevConsumer);
  }
}
