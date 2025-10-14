/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { ValueEqualityFn } from './equality';
import { ReactiveNode, SIGNAL } from './graph';
/**
 * A computation, which derives a value from a declarative reactive expression.
 *
 * `Computed`s are both producers and consumers of reactivity.
 */
export interface ComputedNode<T> extends ReactiveNode {
    /**
     * Current value of the computation, or one of the sentinel values above (`UNSET`, `COMPUTING`,
     * `ERROR`).
     */
    value: T;
    /**
     * If `value` is `ERRORED`, the error caught from the last computation attempt which will
     * be re-thrown.
     */
    error: unknown;
    /**
     * The computation function which will produce a new value.
     */
    computation: () => T;
    equal: ValueEqualityFn<T>;
}
export type ComputedGetter<T> = (() => T) & {
    [SIGNAL]: ComputedNode<T>;
};
/**
 * Create a computed signal which derives a reactive value from an expression.
 */
export declare function createComputed<T>(computation: () => T, equal?: ValueEqualityFn<T>): ComputedGetter<T>;
/**
 * A dedicated symbol used before a computed value has been calculated for the first time.
 * Explicitly typed as `any` so we can use it as signal's value.
 */
export declare const UNSET: any;
/**
 * A dedicated symbol used in place of a computed signal value to indicate that a given computation
 * is in progress. Used to detect cycles in computation chains.
 * Explicitly typed as `any` so we can use it as signal's value.
 */
export declare const COMPUTING: any;
/**
 * A dedicated symbol used in place of a computed signal value to indicate that a given computation
 * failed. The thrown error is cached until the computation gets dirty again.
 * Explicitly typed as `any` so we can use it as signal's value.
 */
export declare const ERRORED: any;
