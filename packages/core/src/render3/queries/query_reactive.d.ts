/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { Signal } from '../reactivity/api';
export declare function createSingleResultOptionalQuerySignalFn<ReadT>(opts?: {
    debugName?: string;
}): Signal<ReadT | undefined>;
export declare function createSingleResultRequiredQuerySignalFn<ReadT>(opts?: {
    debugName?: string;
}): Signal<ReadT>;
export declare function createMultiResultQuerySignalFn<ReadT>(opts?: {
    debugName?: string;
}): Signal<ReadonlyArray<ReadT>>;
export declare function bindQueryToSignal(target: Signal<unknown>, queryIndex: number): void;
