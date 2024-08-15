/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  HYDRATE_TRIGGER_CLEANUP_FNS,
  LDeferBlockDetails,
  PREFETCH_TRIGGER_CLEANUP_FNS,
  TRIGGER_CLEANUP_FNS,
  TriggerType,
  UNIQUE_SSR_ID,
} from './interfaces';
import {DeferBlockRegistry} from './registry';

/**
 * Registers a cleanup function associated with a prefetching trigger
 * or a regular trigger of a defer block.
 */
export function storeTriggerCleanupFn(
  type: TriggerType,
  lDetails: LDeferBlockDetails,
  cleanupFn: VoidFunction,
) {
  let key = TRIGGER_CLEANUP_FNS;
  if (type === TriggerType.Prefetch) {
    key = PREFETCH_TRIGGER_CLEANUP_FNS;
  } else if (type === TriggerType.Hydrate) {
    key = HYDRATE_TRIGGER_CLEANUP_FNS;
  }
  if (lDetails[key] === null) {
    lDetails[key] = [];
  }
  (lDetails[key]! as VoidFunction[]).push(cleanupFn);
}

/**
 * Invokes registered cleanup functions either for prefetch or for regular triggers.
 */
export function invokeTriggerCleanupFns(type: TriggerType, lDetails: LDeferBlockDetails) {
  let key = TRIGGER_CLEANUP_FNS;
  if (type === TriggerType.Prefetch) {
    key = PREFETCH_TRIGGER_CLEANUP_FNS;
  } else if (type === TriggerType.Hydrate) {
    key = HYDRATE_TRIGGER_CLEANUP_FNS;
  }
  const cleanupFns = lDetails[key] as VoidFunction[];
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
export function invokeAllTriggerCleanupFns(
  lDetails: LDeferBlockDetails,
  registry: DeferBlockRegistry,
) {
  registry.invokeCleanupFns(lDetails[UNIQUE_SSR_ID]!);
  invokeTriggerCleanupFns(TriggerType.Prefetch, lDetails);
  invokeTriggerCleanupFns(TriggerType.Regular, lDetails);
}
