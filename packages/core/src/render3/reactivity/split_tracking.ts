/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {untracked} from './untracked';

/**
 * Splits a reactive effect's tracking and side-effecting code, ensuring that the
 * side-effecting code doesn't implicitly track dependencies.
 *
 * @param track A function whose reactive reads will be tracked.
 * @param execute A function which receives the tracked value and the execution context arguments,
 *                and runs in a non-tracking context.
 * @returns A function that combines the tracking and execution phases.
 *
 * @usageNotes
 *
 * ```ts
 * effect(
 *   splitTracking(
 *     () => mySignal(),
 *     (mySignalValue, onCleanup) => {
 *       // Execution phase: any signal reads here are untracked
 *       console.log('Tracked values:', mySignalValue);
 *       console.log('Untracked read:', untrackedSig());
 *     }
 *   )
 * );
 * ```
 *
 * Using `splitTracking` with `afterRenderEffect` phases:
 *
 * ```ts
 * afterRenderEffect({
 *   earlyRead: () => {
 *     return this.element.nativeElement.scrollWidth;
 *   },
 *   write: splitTracking(
 *     // Tracking phase: tracks `isExpanded`
 *     () => this.isExpanded(),
 *     (isExpanded, scrollWidth, onCleanup) => {
 *       // Execution phase: receives `isExpanded` from the track phase,
 *       // and `scrollWidth` from the `earlyRead` phase.
 *       // This block runs untracked, avoiding implicit dependencies on any reads.
 *       if (isExpanded) {
 *         this.element.nativeElement.style.width = `${scrollWidth}px`;
 *       }
 *     }
 *   )
 * });
 * ```
 *
 * @publicApi 22.1
 */
export function splitTracking<T, Ret, Args extends any[]>(
  track: () => T,
  execute: (tracked: T, ...args: Args) => Ret,
): (...args: Args) => Ret {
  return (...args: Args) => {
    const trackedValue = track();
    return untracked(() => execute(trackedValue, ...args));
  };
}
