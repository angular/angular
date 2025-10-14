/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { ValueEqualityFn } from './api';
import { WritableSignal } from './signal';
/**
 * Creates a writable signal whose value is initialized and reset by the linked, reactive computation.
 *
 * @publicApi 20.0
 */
export declare function linkedSignal<D>(computation: () => D, options?: {
    equal?: ValueEqualityFn<NoInfer<D>>;
}): WritableSignal<D>;
/**
 * Creates a writable signal whose value is initialized and reset by the linked, reactive computation.
 * This is an advanced API form where the computation has access to the previous value of the signal and the computation result.
 *
 * Note: The computation is reactive, meaning the linked signal will automatically update whenever any of the signals used within the computation change.
 *
 * @publicApi 20.0
 */
export declare function linkedSignal<S, D>(options: {
    source: () => S;
    computation: (source: NoInfer<S>, previous?: {
        source: NoInfer<S>;
        value: NoInfer<D>;
    }) => D;
    equal?: ValueEqualityFn<NoInfer<D>>;
    debugName?: string;
}): WritableSignal<D>;
