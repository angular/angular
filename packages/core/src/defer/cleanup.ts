/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  LDeferBlockDetails,
  PREFETCH_TRIGGER_CLEANUP_FNS,
  TRIGGER_CLEANUP_FNS,
  TriggerType,
} from './interfaces';

/**
 * Registers a cleanup function associated with a prefetching trigger
 * or a regular trigger of a defer block.
 */
export function storeTriggerCleanupFn(
  type: TriggerType,
  lDetails: LDeferBlockDetails,
  cleanupFn: VoidFunction,
) {
  const key = type === TriggerType.Prefetch ? PREFETCH_TRIGGER_CLEANUP_FNS : TRIGGER_CLEANUP_FNS;
  if (lDetails[key] === null) {
    lDetails[key] = [];
  }
  lDetails[key]!.push(cleanupFn);
}

/**
 * Invokes registered cleanup functions either for prefetch or for regular triggers.
 */
export function invokeTriggerCleanupFns(type: TriggerType, lDetails: LDeferBlockDetails) {
  const key = type === TriggerType.Prefetch ? PREFETCH_TRIGGER_CLEANUP_FNS : TRIGGER_CLEANUP_FNS;
  const cleanupFns = lDetails[key];
  if (cleanupFns !== null) {
    for (const cleanupFn of cleanupFns) {
      cleanupFn();
    }
    lDetails[key] = null;
  }
}

/**
 * Invokes registered cleanup functions for both prefetch and regular triggers.
 */
export function invokeAllTriggerCleanupFns(lDetails: LDeferBlockDetails) {
  invokeTriggerCleanupFns(TriggerType.Prefetch, lDetails);
  invokeTriggerCleanupFns(TriggerType.Regular, lDetails);
}
