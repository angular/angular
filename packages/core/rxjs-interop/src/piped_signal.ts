/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {computed, Injector, signal, Signal} from '@angular/core';
import {toObservable, toSignal} from '@angular/core/rxjs-interop';
import {OperatorFunction} from 'rxjs/dist/types/internal/types';
import {debounceTime, delay} from 'rxjs/operators';

export declare interface PipedSignalOptions {
  /**
   * The `Injector` to use when creating the underlying `effect` which watches the signal.
   *
   * If this isn't specified, the current [injection context](guide/dependency-injection-context)
   * will be used.
   */
  injector?: Injector;
}

// TODO Unit Tests
/**
 * const hello = signal("hello");
 * const delayedHello = pipedSignal(hello, delay(100));
 * const delayedComputation = computed(() => `${delayedHello()}, Angular Team`);
 *
 * @developerPreview
 */
export function pipedSignal<T, A>(
    source: Signal<T>, operation: OperatorFunction<T, A>,
    options: PipedSignalOptions = {}): Signal<A> {
  return toSignal(toObservable(source, options).pipe(operation), {requireSync: true, ...options});
}

// TODO Overload with multiple OperatorFunction
