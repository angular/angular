/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {OutputRef, ɵgetOutputDestroyRef} from '@angular/core';
import {Observable} from 'rxjs';

/**
 * Converts an Angular output declared via `output()` or `outputFromObservable()`
 * to an observable.
 *
 * You can subscribe to the output via `Observable.subscribe` then.
 *
 * @publicApi
 */
export function outputToObservable<T>(ref: OutputRef<T>): Observable<T> {
  const destroyRef = ɵgetOutputDestroyRef(ref);

  return new Observable<T>((observer) => {
    // Complete the observable upon directive/component destroy.
    // Note: May be `undefined` if an `EventEmitter` is declared outside
    // of an injection context.
    destroyRef?.onDestroy(() => observer.complete());

    const subscription = ref.subscribe((v) => observer.next(v));
    return () => subscription.unsubscribe();
  });
}
