/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ɵɵdefineInjectable} from '../di';
import {INJECTOR, LView} from '../render3/interfaces/view';
import {arrayInsert2, arraySplice} from '../util/array_utils';

import {wrapWithLViewCleanup} from './utils';

/**
 * Returns a function that captures a provided delay.
 * Invoking the returned function schedules a trigger.
 */
export function onTimer(delay: number) {
  return (callback: VoidFunction, lView: LView, withLViewCleanup: boolean) =>
             scheduleTimerTrigger(delay, callback, lView, withLViewCleanup);
}

/**
 * Schedules a callback to be invoked after a given timeout.
 *
 * @param delay A number of ms to wait until firing a callback.
 * @param callback A function to be invoked after a timeout.
 * @param lView LView that hosts an instance of a defer block.
 * @param withLViewCleanup A flag that indicates whether a scheduled callback
 *           should be cancelled in case an LView is destroyed before a callback
 *           was invoked.
 */
export function scheduleTimerTrigger(
    delay: number, callback: VoidFunction, lView: LView, withLViewCleanup: boolean) {
  const injector = lView[INJECTOR]!;
  const scheduler = injector.get(TimerScheduler);
  const cleanupFn = () => scheduler.remove(callback);
  const wrappedCallback =
      withLViewCleanup ? wrapWithLViewCleanup(callback, lView, cleanupFn) : callback;
  scheduler.add(delay, wrappedCallback);
  return cleanupFn;
}

/**
 * Helper service to schedule `setTimeout`s for batches of defer blocks,
 * to avoid calling `setTimeout` for each defer block (e.g. if defer blocks
 * are created inside a for loop).
 */
export class TimerScheduler {
  // Indicates whether current callbacks are being invoked.
  executingCallbacks = false;

  // Currently scheduled `setTimeout` id.
  timeoutId: number|null = null;

  // When currently scheduled timer would fire.
  invokeTimerAt: number|null = null;

  // List of callbacks to be invoked.
  // For each callback we also store a timestamp on when the callback
  // should be invoked. We store timestamps and callback functions
  // in a flat array to avoid creating new objects for each entry.
  // [timestamp1, callback1, timestamp2, callback2, ...]
  current: Array<number|VoidFunction> = [];

  // List of callbacks collected while invoking current set of callbacks.
  // Those callbacks are added to the "current" queue at the end of
  // the current callback invocation. The shape of this list is the same
  // as the shape of the `current` list.
  deferred: Array<number|VoidFunction> = [];

  add(delay: number, callback: VoidFunction) {
    const target = this.executingCallbacks ? this.deferred : this.current;
    this.addToQueue(target, Date.now() + delay, callback);
    this.scheduleTimer();
  }

  remove(callback: VoidFunction) {
    const callbackIndex = this.removeFromQueue(this.current, callback);
    if (callbackIndex === -1) {
      // Try cleaning up deferred queue only in case
      // we didn't find a callback in the "current" queue.
      this.removeFromQueue(this.deferred, callback);
    }
  }

  private addToQueue(target: Array<number|VoidFunction>, invokeAt: number, callback: VoidFunction) {
    let insertAtIndex = target.length;
    for (let i = 0; i < target.length; i += 2) {
      const invokeQueuedCallbackAt = target[i] as number;
      if (invokeQueuedCallbackAt > invokeAt) {
        // We've reached a first timer that is scheduled
        // for a later time than what we are trying to insert.
        // This is the location at which we need to insert,
        // no need to iterate further.
        insertAtIndex = i;
        break;
      }
    }
    arrayInsert2(target, insertAtIndex, invokeAt, callback);
  }

  private removeFromQueue(target: Array<number|VoidFunction>, callback: VoidFunction) {
    let index = -1;
    for (let i = 0; i < target.length; i += 2) {
      const queuedCallback = target[i + 1];
      if (queuedCallback === callback) {
        index = i;
        break;
      }
    }
    if (index > -1) {
      // Remove 2 elements: a timestamp slot and
      // the following slot with a callback function.
      arraySplice(target, index, 2);
    }
    return index;
  }

  private scheduleTimer() {
    const callback = () => {
      clearTimeout(this.timeoutId!);
      this.timeoutId = null;

      this.executingCallbacks = true;

      // Invoke callbacks that were scheduled to run
      // before the current time.
      let now = Date.now();
      let lastCallbackIndex: number|null = null;
      for (let i = 0; i < this.current.length; i += 2) {
        const invokeAt = this.current[i] as number;
        const callback = this.current[i + 1] as VoidFunction;
        if (invokeAt <= now) {
          callback();
          // Point at the invoked callback function, which is located
          // after the timestamp.
          lastCallbackIndex = i + 1;
        } else {
          // We've reached a timer that should not be invoked yet.
          break;
        }
      }
      if (lastCallbackIndex !== null) {
        // If last callback index is `null` - no callbacks were invoked,
        // so no cleanup is needed. Otherwise, remove invoked callbacks
        // from the queue.
        arraySplice(this.current, 0, lastCallbackIndex + 1);
      }

      this.executingCallbacks = false;

      // If there are any callbacks added during an invocation
      // of the current ones - move them over to the "current"
      // queue.
      if (this.deferred.length > 0) {
        for (let i = 0; i < this.deferred.length; i += 2) {
          const invokeAt = this.deferred[i] as number;
          const callback = this.deferred[i + 1] as VoidFunction;
          this.addToQueue(this.current, invokeAt, callback);
        }
        this.deferred.length = 0;
      }
      this.scheduleTimer();
    };

    // Avoid running timer callbacks more than once per
    // average frame duration. This is needed for better
    // batching and to avoid kicking off excessive change
    // detection cycles.
    const FRAME_DURATION_MS = 16;  // 1000ms / 60fps

    if (this.current.length > 0) {
      const now = Date.now();
      // First element in the queue points at the timestamp
      // of the first (earliest) event.
      const invokeAt = this.current[0] as number;
      if (!this.timeoutId ||
          // Reschedule a timer in case a queue contains an item with
          // an earlier timestamp and the delta is more than an average
          // frame duration.
          (this.invokeTimerAt && (this.invokeTimerAt - invokeAt > FRAME_DURATION_MS))) {
        if (this.timeoutId !== null) {
          // There was a timeout already, but an earlier event was added
          // into the queue. In this case we drop an old timer and setup
          // a new one with an updated (smaller) timeout.
          clearTimeout(this.timeoutId);
          this.timeoutId = null;
        }
        const timeout = Math.max(invokeAt - now, FRAME_DURATION_MS);
        this.invokeTimerAt = invokeAt;
        this.timeoutId = setTimeout(callback, timeout) as unknown as number;
      }
    }
  }

  ngOnDestroy() {
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    this.current.length = 0;
    this.deferred.length = 0;
  }

  /** @nocollapse */
  static ɵprov = /** @pureOrBreakMyCode */ ɵɵdefineInjectable({
    token: TimerScheduler,
    providedIn: 'root',
    factory: () => new TimerScheduler(),
  });
}
