/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Observable} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

/**
 * Converts an AbortSignal to an Observable<void>.
 * Emits and completes when the signal is aborted.
 * If the signal is already aborted when subscribed, it emits and completes immediately.
 */
export function abortSignalToObservable(signal: AbortSignal): Observable<void> {
  return new Observable<void>((subscriber) => {
    if (signal.aborted) {
      subscriber.next();
      subscriber.complete();
      return;
    }
    const handler = () => {
      subscriber.next();
      subscriber.complete();
    };
    signal.addEventListener('abort', handler);
    return () => signal.removeEventListener('abort', handler);
  });
}

export function takeUntilAbort<T>(signal: AbortSignal) {
  return takeUntil<T>(abortSignalToObservable(signal));
}
