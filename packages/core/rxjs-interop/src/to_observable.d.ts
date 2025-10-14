/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { Injector, Signal } from '../../src/core';
import { Observable } from 'rxjs';
/**
 * Options for `toObservable`.
 *
 * @publicApi 20.0
 */
export interface ToObservableOptions {
    /**
     * The `Injector` to use when creating the underlying `effect` which watches the signal.
     *
     * If this isn't specified, the current [injection context](guide/di/dependency-injection-context)
     * will be used.
     */
    injector?: Injector;
}
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
export declare function toObservable<T>(source: Signal<T>, options?: ToObservableOptions): Observable<T>;
