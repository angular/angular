/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { SignalGetter } from '../../../primitives/signals';
import { Signal, ValueEqualityFn } from './api';
/** Symbol used distinguish `WritableSignal` from other non-writable signals and functions. */
export declare const ɵWRITABLE_SIGNAL: unique symbol;
/**
 * A `Signal` with a value that can be mutated via a setter interface.
 *
 * @publicApi 17.0
 */
export interface WritableSignal<T> extends Signal<T> {
    [ɵWRITABLE_SIGNAL]: T;
    /**
     * Directly set the signal to a new value, and notify any dependents.
     */
    set(value: T): void;
    /**
     * Update the value of the signal based on its current value, and
     * notify any dependents.
     */
    update(updateFn: (value: T) => T): void;
    /**
     * Returns a readonly version of this signal. Readonly signals can be accessed to read their value
     * but can't be changed using set or update methods. The readonly signals do _not_ have
     * any built-in mechanism that would prevent deep-mutation of their value.
     */
    asReadonly(): Signal<T>;
}
/**
 * Utility function used during template type checking to extract the value from a `WritableSignal`.
 * @codeGenApi
 */
export declare function ɵunwrapWritableSignal<T>(value: T | {
    [ɵWRITABLE_SIGNAL]: T;
}): T;
/**
 * Options passed to the `signal` creation function.
 */
export interface CreateSignalOptions<T> {
    /**
     * A comparison function which defines equality for signal values.
     */
    equal?: ValueEqualityFn<T>;
    /**
     * A debug name for the signal. Used in Angular DevTools to identify the signal.
     */
    debugName?: string;
}
/**
 * Create a `Signal` that can be set or updated directly.
 */
export declare function signal<T>(initialValue: T, options?: CreateSignalOptions<T>): WritableSignal<T>;
export declare function signalAsReadonlyFn<T>(this: SignalGetter<T>): Signal<T>;
/**
 * Checks if the given `value` is a writeable signal.
 */
export declare function isWritableSignal(value: unknown): value is WritableSignal<unknown>;
