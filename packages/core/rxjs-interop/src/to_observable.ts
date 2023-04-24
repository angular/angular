/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {assertInInjectionContext, effect, inject, Injector, Signal} from '@angular/core';
import {Observable} from 'rxjs';

/**
 * Options for `toObservable`.
 *
 * @developerPreview
 */
export interface ToObservableOptions {
  /**
   * The `Injector` to use when creating the effect.
   *
   * If this isn't specified, the current injection context will be used.
   */
  injector?: Injector;
}

/**
 * Exposes the value of an Angular `Signal` as an RxJS `Observable`.
 *
 * The signal's value will be propagated into the `Observable`'s subscribers using an `effect`.
 *
 * `toObservable` must be called in an injection context.
 *
 * @developerPreview
 */
export function toObservable<T>(
    source: Signal<T>,
    options?: ToObservableOptions,
    ): Observable<T> {
  !options?.injector && assertInInjectionContext(toObservable);
  const injector = options?.injector ?? inject(Injector);

  // Creating a new `Observable` allows the creation of the effect to be lazy. This allows for all
  // references to `source` to be dropped if the `Observable` is fully unsubscribed and thrown away.
  return new Observable(observer => {
    const watcher = effect(() => {
      let value: T;
      try {
        value = source();
      } catch (err) {
        observer.error(err);
        return;
      }
      observer.next(value);
    }, {injector, manualCleanup: true, allowSignalWrites: true});
    return () => watcher.destroy();
  });
}
