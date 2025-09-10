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
  inject,
  OutputOptions,
  OutputRef,
  OutputRefSubscription,
  ɵRuntimeError,
  ɵRuntimeErrorCode,
} from '../../src/core';
import {Observable} from 'rxjs';

import {takeUntilDestroyed} from './take_until_destroyed';

/**
 * Implementation of `OutputRef` that emits values from
 * an RxJS observable source.
 *
 * @internal
 */
class OutputFromObservableRef<T> implements OutputRef<T> {
  private destroyed = false;

  destroyRef = inject(DestroyRef);

  constructor(private source: Observable<T>) {
    this.destroyRef.onDestroy(() => {
      this.destroyed = true;
    });
  }

  subscribe(callbackFn: (value: T) => void): OutputRefSubscription {
    if (this.destroyed) {
      throw new ɵRuntimeError(
        ɵRuntimeErrorCode.OUTPUT_REF_DESTROYED,
        ngDevMode &&
          'Unexpected subscription to destroyed `OutputRef`. ' +
            'The owning directive/component is destroyed.',
      );
    }

    // Stop yielding more values when the directive/component is already destroyed.
    const subscription = this.source.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (value) => callbackFn(value),
    });

    return {
      unsubscribe: () => subscription.unsubscribe(),
    };
  }
}

/**
 * Declares an Angular output that is using an RxJS observable as a source
 * for events dispatched to parent subscribers.
 *
 * The behavior for an observable as source is defined as followed:
 *    1. New values are forwarded to the Angular output (next notifications).
 *    2. Errors notifications are not handled by Angular. You need to handle these manually.
 *       For example by using `catchError`.
 *    3. Completion notifications stop the output from emitting new values.
 *
 * @usageNotes
 * Initialize an output in your directive by declaring a
 * class field and initializing it with the `outputFromObservable()` function.
 *
 * ```ts
 * @Directive({..})
 * export class MyDir {
 *   nameChange$ = <some-observable>;
 *   nameChange = outputFromObservable(this.nameChange$);
 * }
 * ```
 *
 * @publicApi 19.0
 */
export function outputFromObservable<T>(
  observable: Observable<T>,
  opts?: OutputOptions,
): OutputRef<T> {
  typeof ngDevMode !== 'undefined' && ngDevMode && assertInInjectionContext(outputFromObservable);
  return new OutputFromObservableRef<T>(observable);
}
