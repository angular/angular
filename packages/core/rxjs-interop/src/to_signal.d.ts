/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { Injector, Signal } from '../../src/core';
import { ValueEqualityFn } from '../../primitives/signals';
import { Observable, Subscribable } from 'rxjs';
/**
 * Options for `toSignal`.
 *
 * @publicApi 20.0
 */
export interface ToSignalOptions<T> {
    /**
     * Initial value for the signal produced by `toSignal`.
     *
     * This will be the value of the signal until the observable emits its first value.
     */
    initialValue?: unknown;
    /**
     * Whether to require that the observable emits synchronously when `toSignal` subscribes.
     *
     * If this is `true`, `toSignal` will assert that the observable produces a value immediately upon
     * subscription. Setting this option removes the need to either deal with `undefined` in the
     * signal type or provide an `initialValue`, at the cost of a runtime error if this requirement is
     * not met.
     */
    requireSync?: boolean;
    /**
     * `Injector` which will provide the `DestroyRef` used to clean up the Observable subscription.
     *
     * If this is not provided, a `DestroyRef` will be retrieved from the current [injection
     * context](guide/di/dependency-injection-context), unless manual cleanup is requested.
     */
    injector?: Injector;
    /**
     * Whether the subscription should be automatically cleaned up (via `DestroyRef`) when
     * `toSignal`'s creation context is destroyed.
     *
     * If manual cleanup is enabled, then `DestroyRef` is not used, and the subscription will persist
     * until the `Observable` itself completes.
     */
    manualCleanup?: boolean;
    /**
     * A comparison function which defines equality for values emitted by the observable.
     *
     * Equality comparisons are executed against the initial value if one is provided.
     */
    equal?: ValueEqualityFn<T>;
}
export declare function toSignal<T>(source: Observable<T> | Subscribable<T>): Signal<T | undefined>;
export declare function toSignal<T>(source: Observable<T> | Subscribable<T>, options: NoInfer<ToSignalOptions<T | undefined>> & {
    initialValue?: undefined;
    requireSync?: false;
}): Signal<T | undefined>;
export declare function toSignal<T>(source: Observable<T> | Subscribable<T>, options: NoInfer<ToSignalOptions<T | null>> & {
    initialValue?: null;
    requireSync?: false;
}): Signal<T | null>;
export declare function toSignal<T>(source: Observable<T> | Subscribable<T>, options: NoInfer<ToSignalOptions<T>> & {
    initialValue?: undefined;
    requireSync: true;
}): Signal<T>;
export declare function toSignal<T, const U extends T>(source: Observable<T> | Subscribable<T>, options: NoInfer<ToSignalOptions<T | U>> & {
    initialValue: U;
    requireSync?: false;
}): Signal<T | U>;
