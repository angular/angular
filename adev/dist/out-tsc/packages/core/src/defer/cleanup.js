/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {
  HYDRATE_TRIGGER_CLEANUP_FNS,
  PREFETCH_TRIGGER_CLEANUP_FNS,
  TRIGGER_CLEANUP_FNS,
} from './interfaces';
/**
 * Registers a cleanup function associated with a prefetching trigger
 * or a regular trigger of a defer block.
 */
export function storeTriggerCleanupFn(type, lDetails, cleanupFn) {
  const key = getCleanupFnKeyByType(type);
  if (lDetails[key] === null) {
    lDetails[key] = [];
  }
  lDetails[key].push(cleanupFn);
}
/**
 * Invokes registered cleanup functions either for prefetch or for regular triggers.
 */
export function invokeTriggerCleanupFns(type, lDetails) {
  const key = getCleanupFnKeyByType(type);
  const cleanupFns = lDetails[key];
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
export function invokeAllTriggerCleanupFns(lDetails) {
  invokeTriggerCleanupFns(1 /* TriggerType.Prefetch */, lDetails);
  invokeTriggerCleanupFns(0 /* TriggerType.Regular */, lDetails);
  invokeTriggerCleanupFns(2 /* TriggerType.Hydrate */, lDetails);
}
function getCleanupFnKeyByType(type) {
  let key = TRIGGER_CLEANUP_FNS;
  if (type === 1 /* TriggerType.Prefetch */) {
    key = PREFETCH_TRIGGER_CLEANUP_FNS;
  } else if (type === 2 /* TriggerType.Hydrate */) {
    key = HYDRATE_TRIGGER_CLEANUP_FNS;
  }
  return key;
}
//# sourceMappingURL=cleanup.js.map
