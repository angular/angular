/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { LDeferBlockDetails, TriggerType } from './interfaces';
/**
 * Registers a cleanup function associated with a prefetching trigger
 * or a regular trigger of a defer block.
 */
export declare function storeTriggerCleanupFn(type: TriggerType, lDetails: LDeferBlockDetails, cleanupFn: VoidFunction): void;
/**
 * Invokes registered cleanup functions either for prefetch or for regular triggers.
 */
export declare function invokeTriggerCleanupFns(type: TriggerType, lDetails: LDeferBlockDetails): void;
/**
 * Invokes registered cleanup functions for prefetch, hydrate, and regular triggers.
 */
export declare function invokeAllTriggerCleanupFns(lDetails: LDeferBlockDetails): void;
