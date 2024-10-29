/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Injector} from '../di';
import {
  HYDRATE_TRIGGER_CLEANUP_FNS,
  LDeferBlockDetails,
  PREFETCH_TRIGGER_CLEANUP_FNS,
  TRIGGER_CLEANUP_FNS,
  TriggerType,
  SSR_UNIQUE_ID,
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
  const key = getCleanupFnKeyByType(type);
  if (lDetails[key] === null) {
    lDetails[key] = [];
  }
  (lDetails[key]! as VoidFunction[]).push(cleanupFn);
}

/**
 * Invokes registered cleanup functions either for prefetch or for regular triggers.
 */
export function invokeTriggerCleanupFns(type: TriggerType, lDetails: LDeferBlockDetails) {
  const key = getCleanupFnKeyByType(type);
  const cleanupFns = lDetails[key] as VoidFunction[];
  if (cleanupFns !== null) {
    for (const cleanupFn of cleanupFns) {
      cleanupFn();
    }
    lDetails[key] = null;
  }
}

/**
 * Invokes registered cleanup functions for prefetch, hydrate, and regular triggers.
 */
export function invokeAllTriggerCleanupFns(
  lDetails: LDeferBlockDetails,
  registry: DeferBlockRegistry | null,
) {
  // TODO(incremental-hydration): cleanup functions are invoked in multiple places
  // should we centralize where cleanup functions are invoked to this registry?
  if (registry !== null) {
    registry.invokeCleanupFns(lDetails[SSR_UNIQUE_ID]!);
  }

  invokeTriggerCleanupFns(TriggerType.Prefetch, lDetails);
  invokeTriggerCleanupFns(TriggerType.Regular, lDetails);
}

function getCleanupFnKeyByType(type: TriggerType): number {
  let key = TRIGGER_CLEANUP_FNS;
  if (type === TriggerType.Prefetch) {
    key = PREFETCH_TRIGGER_CLEANUP_FNS;
  } else if (type === TriggerType.Hydrate) {
    key = HYDRATE_TRIGGER_CLEANUP_FNS;
  }
  return key;
}
