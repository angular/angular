/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/** @fileoverview DtLink utilities specific to `ng-devtools` */

import {Signal, signal} from '@angular/core';

/** Convert a DtLink async generator to a signal. */
export function convertGeneratorToSignal<T, R>(
  generator: () => Promise<AsyncGenerator<T, R>>,
  initialValue: T | R,
): Signal<T | R> {
  const sig = signal(initialValue);

  generator().then(async (iter) => {
    let result: IteratorResult<T, R>;
    while (!(result = await iter.next()).done) {
      sig.set(result.value);
    }
    sig.set(result.value);
  });

  return sig.asReadonly();
}
