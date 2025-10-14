/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {
  assertInInjectionContext,
  DestroyRef,
  effect,
  inject,
  Injector,
  untracked,
} from '../../src/core';
import {ReplaySubject} from 'rxjs';
/**
 * Exposes the value of an Angular `Signal` as an RxJS `Observable`.
 * As it reflects a state, the observable will always emit the latest value upon subscription.
 *
 * The signal's value will be propagated into the `Observable`'s subscribers using an `effect`.
 *
 * `toObservable` must be called in an injection context unless an injector is provided via options.
 *
 * @publicApi 20.0
 */
export function toObservable(source, options) {
  if (ngDevMode && !options?.injector) {
    assertInInjectionContext(toObservable);
  }
  const injector = options?.injector ?? inject(Injector);
  const subject = new ReplaySubject(1);
  const watcher = effect(
    () => {
      let value;
      try {
        value = source();
      } catch (err) {
        untracked(() => subject.error(err));
        return;
      }
      untracked(() => subject.next(value));
    },
    {injector, manualCleanup: true},
  );
  injector.get(DestroyRef).onDestroy(() => {
    watcher.destroy();
    subject.complete();
  });
  return subject.asObservable();
}
//# sourceMappingURL=to_observable.js.map
