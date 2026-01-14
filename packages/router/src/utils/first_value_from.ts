/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Observable} from 'rxjs';
import {first} from 'rxjs/operators';

/** replacement for firstValueFrom in rxjs 7. We must support rxjs v6 so we cannot use it */
export function firstValueFrom<T>(source: Observable<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    source.pipe(first()).subscribe({
      next: (value) => resolve(value),
      // Issue: When an observable completes without emitting, the `first()` operator
      // throws `EmptyError` synchronously. This causes the promise
      // to reject synchronously, before the caller can attach a `.catch()` handler. Zone.js
      // detects this as an unhandled rejection and logs/re-throws the error, even though
      // the caller does properly handle it with `.catch()` or try-catch.
      //
      // Defer the rejection by one microtask using `queueMicrotask()`. This ensures
      // the caller's `.catch()` handler is attached before the rejection occurs, satisfying
      // zone.js's unhandled rejection detection.
      //
      // This change becomes obsolete when Angular entirely drops zone.js support.
      error: (err) => queueMicrotask(() => reject(err)),
    });
  });
}
