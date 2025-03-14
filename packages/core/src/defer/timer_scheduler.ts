/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Injector, ɵɵdefineInjectable} from '../di';
import {arrayInsert2, arraySplice} from '../util/array_utils';
import {NgZone} from '../zone';

/**
 * Returns a function that captures a provided delay.
 * Invoking the returned function schedules a trigger.
 */
export function onTimer(delay: number) {
  return (callback: VoidFunction, injector: Injector) =>
    scheduleTimerTrigger(delay, callback, injector);
}

/**
 * Schedules a callback to be invoked after a given timeout.
 *
 * @param delay A number of ms to wait until firing a callback.
 * @param callback A function to be invoked after a timeout.
 * @param injector injector for the app.
 */
export function scheduleTimerTrigger(delay: number, callback: VoidFunction, injector: Injector) {
  const scheduler = injector.get(TimerScheduler);
  const ngZone = injector.get(NgZone);
  const cleanupFn = () => scheduler.remove(callback);
  scheduler.add(delay, callback, ngZone);
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
  timeoutId: number | null = null;

  // When currently scheduled timer would fire.
  invokeTimerAt: number | null = null;

  // List of callbacks to be invoked.
  // For each callback we also store a timestamp on when the callback
  // should be invoked. We store timestamps and callback functions
  // in a flat array to avoid creating new objects for each entry.
  // [timestamp1, callback1, timestamp2, callback2, ...]
  current: Array<number | VoidFunction> = [];

  // List of callbacks collected while invoking current set of callbacks.
  // Those callbacks are added to the "current" queue at the end of
  // the current callback invocation. The shape of this list is the same
  // as the shape of the `current` list.
  deferred: Array<number | VoidFunction> = [];

  add(delay: number, callback: VoidFunction, ngZone: NgZone) {
    const target = this.executingCallbacks ? this.deferred : this.current;
    this.addToQueue(target, Date.now() + delay, callback);
    this.scheduleTimer(ngZone);
  }

  remove(callback: VoidFunction) {
    const {current, deferred} = this;
    const callbackIndex = this.removeFromQueue(current, callback);
    if (callbackIndex === -1) {
      // Try cleaning up deferred queue only in case
      // we didn't find a callback in the "current" queue.
      this.removeFromQueue(deferred, callback);
    }
    // If the last callback was removed and there is a pending timeout - cancel it.
    if (current.length === 0 && deferred.length === 0) {
      this.clearTimeout();
    }
  }

  private addToQueue(
    target: Array<number | VoidFunction>,
    invokeAt: number,
    callback: VoidFunction,
  ) {
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

  private removeFromQueue(target: Array<number | VoidFunction>, callback: VoidFunction) {
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

  private scheduleTimer(ngZone: NgZone) {
    const callback = () => {
      this.clearTimeout();

      this.executingCallbacks = true;

      // Clone the current state of the queue, since it might be altered
      // as we invoke callbacks.
      const current = [...this.current];

      // Invoke callbacks that were scheduled to run before the current time.
      const now = Date.now();
      for (let i = 0; i < current.length; i += 2) {
        const invokeAt = current[i] as number;
        const callback = current[i + 1] as VoidFunction;
        if (invokeAt <= now) {
          callback();
        } else {
          // We've reached a timer that should not be invoked yet.
          break;
        }
      }
      // The state of the queue might've changed after callbacks invocation,
      // run the cleanup logic based on the *current* state of the queue.
      let lastCallbackIndex = -1;
      for (let i = 0; i < this.current.length; i += 2) {
        const invokeAt = this.current[i] as number;
        if (invokeAt <= now) {
          // Add +1 to account for a callback function that
          // goes after the timestamp in events array.
          lastCallbackIndex = i + 1;
        } else {
          // We've reached a timer that should not be invoked yet.
          break;
        }
      }
      if (lastCallbackIndex >= 0) {
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
      this.scheduleTimer(ngZone);
    };

    // Avoid running timer callbacks more than once per
    // average frame duration. This is needed for better
    // batching and to avoid kicking off excessive change
    // detection cycles.
    const FRAME_DURATION_MS = 16; // 1000ms / 60fps

    if (this.current.length > 0) {
      const now = Date.now();
      // First element in the queue points at the timestamp
      // of the first (earliest) event.
      const invokeAt = this.current[0] as number;
      if (
        this.timeoutId === null ||
        // Reschedule a timer in case a queue contains an item with
        // an earlier timestamp and the delta is more than an average
        // frame duration.
        (this.invokeTimerAt && this.invokeTimerAt - invokeAt > FRAME_DURATION_MS)
      ) {
        // There was a timeout already, but an earlier event was added
        // into the queue. In this case we drop an old timer and setup
        // a new one with an updated (smaller) timeout.
        this.clearTimeout();

        const timeout = Math.max(invokeAt - now, FRAME_DURATION_MS);
        this.invokeTimerAt = invokeAt;
        this.timeoutId = ngZone.runOutsideAngular(() => {
          return setTimeout(() => ngZone.run(callback), timeout) as unknown as number;
        });
      }
    }
  }

  private clearTimeout() {
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  ngOnDestroy() {
    this.clearTimeout();
    this.current.length = 0;
    this.deferred.length = 0;
  }

  /** @nocollapse */
  static ɵprov = /** @pureOrBreakMyCode */ /* @__PURE__ */ ɵɵdefineInjectable({
    token: TimerScheduler,
    providedIn: 'root',
    factory: () => new TimerScheduler(),
  });
}
