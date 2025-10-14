/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {SCHEDULE_IN_ROOT_ZONE_DEFAULT} from '../change_detection/scheduling/flags';
import {RuntimeError} from '../errors';
import {EventEmitter} from '../event_emitter';
import {scheduleCallbackWithRafRace} from '../util/callback_scheduler';
import {noop} from '../util/noop';
import {AsyncStackTaggingZoneSpec} from './async-stack-tagging';
const isAngularZoneProperty = 'isAngularZone';
export const angularZoneInstanceIdProperty = isAngularZoneProperty + '_ID';
let ngZoneInstanceId = 0;
/**
 * An injectable service for executing work inside or outside of the Angular zone.
 *
 * The most common use of this service is to optimize performance when starting a work consisting of
 * one or more asynchronous tasks that don't require UI updates or error handling to be handled by
 * Angular. Such tasks can be kicked off via {@link #runOutsideAngular} and if needed, these tasks
 * can reenter the Angular zone via {@link #run}.
 *
 * <!-- TODO: add/fix links to:
 *   - docs explaining zones and the use of zones in Angular and change-detection
 *   - link to runOutsideAngular/run (throughout this file!)
 *   -->
 *
 * @usageNotes
 * ### Example
 *
 * ```ts
 * import {Component, NgZone} from '@angular/core';
 *
 * @Component({
 *   selector: 'ng-zone-demo',
 *   template: `
 *     <h2>Demo: NgZone</h2>
 *
 *     <p>Progress: {{progress}}%</p>
 *     @if(progress >= 100) {
 *        <p>Done processing {{label}} of Angular zone!</p>
 *     }
 *
 *     <button (click)="processWithinAngularZone()">Process within Angular zone</button>
 *     <button (click)="processOutsideOfAngularZone()">Process outside of Angular zone</button>
 *   `,
 * })
 * export class NgZoneDemo {
 *   progress: number = 0;
 *   label: string;
 *
 *   constructor(private _ngZone: NgZone) {}
 *
 *   // Loop inside the Angular zone
 *   // so the UI DOES refresh after each setTimeout cycle
 *   processWithinAngularZone() {
 *     this.label = 'inside';
 *     this.progress = 0;
 *     this._increaseProgress(() => console.log('Inside Done!'));
 *   }
 *
 *   // Loop outside of the Angular zone
 *   // so the UI DOES NOT refresh after each setTimeout cycle
 *   processOutsideOfAngularZone() {
 *     this.label = 'outside';
 *     this.progress = 0;
 *     this._ngZone.runOutsideAngular(() => {
 *       this._increaseProgress(() => {
 *         // reenter the Angular zone and display done
 *         this._ngZone.run(() => { console.log('Outside Done!'); });
 *       });
 *     });
 *   }
 *
 *   _increaseProgress(doneCallback: () => void) {
 *     this.progress += 1;
 *     console.log(`Current progress: ${this.progress}%`);
 *
 *     if (this.progress < 100) {
 *       window.setTimeout(() => this._increaseProgress(doneCallback), 10);
 *     } else {
 *       doneCallback();
 *     }
 *   }
 * }
 * ```
 *
 * @publicApi
 */
export class NgZone {
  hasPendingMacrotasks = false;
  hasPendingMicrotasks = false;
  /**
   * Whether there are no outstanding microtasks or macrotasks.
   */
  isStable = true;
  /**
   * Notifies when code enters Angular Zone. This gets fired first on VM Turn.
   */
  onUnstable = new EventEmitter(false);
  /**
   * Notifies when there is no more microtasks enqueued in the current VM Turn.
   * This is a hint for Angular to do change detection, which may enqueue more microtasks.
   * For this reason this event can fire multiple times per VM Turn.
   */
  onMicrotaskEmpty = new EventEmitter(false);
  /**
   * Notifies when the last `onMicrotaskEmpty` has run and there are no more microtasks, which
   * implies we are about to relinquish VM turn.
   * This event gets called just once.
   */
  onStable = new EventEmitter(false);
  /**
   * Notifies that an error has been delivered.
   */
  onError = new EventEmitter(false);
  constructor(options) {
    const {
      enableLongStackTrace = false,
      shouldCoalesceEventChangeDetection = false,
      shouldCoalesceRunChangeDetection = false,
      scheduleInRootZone = SCHEDULE_IN_ROOT_ZONE_DEFAULT,
    } = options;
    if (typeof Zone == 'undefined') {
      throw new RuntimeError(
        908 /* RuntimeErrorCode.MISSING_ZONEJS */,
        ngDevMode && `In this configuration Angular requires Zone.js`,
      );
    }
    Zone.assertZonePatched();
    const self = this;
    self._nesting = 0;
    self._outer = self._inner = Zone.current;
    // AsyncStackTaggingZoneSpec provides `linked stack traces` to show
    // where the async operation is scheduled. For more details, refer
    // to this article, https://developer.chrome.com/blog/devtools-better-angular-debugging/
    // And we only import this AsyncStackTaggingZoneSpec in development mode,
    // in the production mode, the AsyncStackTaggingZoneSpec will be tree shaken away.
    if (ngDevMode) {
      self._inner = self._inner.fork(new AsyncStackTaggingZoneSpec('Angular'));
    }
    if (Zone['TaskTrackingZoneSpec']) {
      self._inner = self._inner.fork(new Zone['TaskTrackingZoneSpec']());
    }
    if (enableLongStackTrace && Zone['longStackTraceZoneSpec']) {
      self._inner = self._inner.fork(Zone['longStackTraceZoneSpec']);
    }
    // if shouldCoalesceRunChangeDetection is true, all tasks including event tasks will be
    // coalesced, so shouldCoalesceEventChangeDetection option is not necessary and can be skipped.
    self.shouldCoalesceEventChangeDetection =
      !shouldCoalesceRunChangeDetection && shouldCoalesceEventChangeDetection;
    self.shouldCoalesceRunChangeDetection = shouldCoalesceRunChangeDetection;
    self.callbackScheduled = false;
    self.scheduleInRootZone = scheduleInRootZone;
    forkInnerZoneWithAngularBehavior(self);
  }
  /**
      This method checks whether the method call happens within an Angular Zone instance.
    */
  static isInAngularZone() {
    // Zone needs to be checked, because this method might be called even when NoopNgZone is used.
    return typeof Zone !== 'undefined' && Zone.current.get(isAngularZoneProperty) === true;
  }
  /**
      Assures that the method is called within the Angular Zone, otherwise throws an error.
    */
  static assertInAngularZone() {
    if (!NgZone.isInAngularZone()) {
      throw new RuntimeError(
        909 /* RuntimeErrorCode.UNEXPECTED_ZONE_STATE */,
        ngDevMode && 'Expected to be in Angular Zone, but it is not!',
      );
    }
  }
  /**
      Assures that the method is called outside of the Angular Zone, otherwise throws an error.
    */
  static assertNotInAngularZone() {
    if (NgZone.isInAngularZone()) {
      throw new RuntimeError(
        909 /* RuntimeErrorCode.UNEXPECTED_ZONE_STATE */,
        ngDevMode && 'Expected to not be in Angular Zone, but it is!',
      );
    }
  }
  /**
   * Executes the `fn` function synchronously within the Angular zone and returns value returned by
   * the function.
   *
   * Running functions via `run` allows you to reenter Angular zone from a task that was executed
   * outside of the Angular zone (typically started via {@link #runOutsideAngular}).
   *
   * Any future tasks or microtasks scheduled from within this function will continue executing from
   * within the Angular zone.
   *
   * If a synchronous error happens it will be rethrown and not reported via `onError`.
   */
  run(fn, applyThis, applyArgs) {
    return this._inner.run(fn, applyThis, applyArgs);
  }
  /**
   * Executes the `fn` function synchronously within the Angular zone as a task and returns value
   * returned by the function.
   *
   * Running functions via `runTask` allows you to reenter Angular zone from a task that was executed
   * outside of the Angular zone (typically started via {@link #runOutsideAngular}).
   *
   * Any future tasks or microtasks scheduled from within this function will continue executing from
   * within the Angular zone.
   *
   * If a synchronous error happens it will be rethrown and not reported via `onError`.
   */
  runTask(fn, applyThis, applyArgs, name) {
    const zone = this._inner;
    const task = zone.scheduleEventTask('NgZoneEvent: ' + name, fn, EMPTY_PAYLOAD, noop, noop);
    try {
      return zone.runTask(task, applyThis, applyArgs);
    } finally {
      zone.cancelTask(task);
    }
  }
  /**
   * Same as `run`, except that synchronous errors are caught and forwarded via `onError` and not
   * rethrown.
   */
  runGuarded(fn, applyThis, applyArgs) {
    return this._inner.runGuarded(fn, applyThis, applyArgs);
  }
  /**
   * Executes the `fn` function synchronously in Angular's parent zone and returns value returned by
   * the function.
   *
   * Running functions via {@link #runOutsideAngular} allows you to escape Angular's zone and do
   * work that
   * doesn't trigger Angular change-detection or is subject to Angular's error handling.
   *
   * Any future tasks or microtasks scheduled from within this function will continue executing from
   * outside of the Angular zone.
   *
   * Use {@link #run} to reenter the Angular zone and do work that updates the application model.
   */
  runOutsideAngular(fn) {
    return this._outer.run(fn);
  }
}
const EMPTY_PAYLOAD = {};
function checkStable(zone) {
  // TODO: @JiaLiPassion, should check zone.isCheckStableRunning to prevent
  // re-entry. The case is:
  //
  // @Component({...})
  // export class AppComponent {
  // constructor(private ngZone: NgZone) {
  //   this.ngZone.onStable.subscribe(() => {
  //     this.ngZone.run(() => console.log('stable'););
  //   });
  // }
  //
  // The onStable subscriber run another function inside ngZone
  // which causes `checkStable()` re-entry.
  // But this fix causes some issues in g3, so this fix will be
  // launched in another PR.
  if (zone._nesting == 0 && !zone.hasPendingMicrotasks && !zone.isStable) {
    try {
      zone._nesting++;
      zone.onMicrotaskEmpty.emit(null);
    } finally {
      zone._nesting--;
      if (!zone.hasPendingMicrotasks) {
        try {
          zone.runOutsideAngular(() => zone.onStable.emit(null));
        } finally {
          zone.isStable = true;
        }
      }
    }
  }
}
function delayChangeDetectionForEvents(zone) {
  /**
   * We also need to check _nesting here
   * Consider the following case with shouldCoalesceRunChangeDetection = true
   *
   * ngZone.run(() => {});
   * ngZone.run(() => {});
   *
   * We want the two `ngZone.run()` only trigger one change detection
   * when shouldCoalesceRunChangeDetection is true.
   * And because in this case, change detection run in async way(requestAnimationFrame),
   * so we also need to check the _nesting here to prevent multiple
   * change detections.
   */
  if (zone.isCheckStableRunning || zone.callbackScheduled) {
    return;
  }
  zone.callbackScheduled = true;
  function scheduleCheckStable() {
    scheduleCallbackWithRafRace(() => {
      zone.callbackScheduled = false;
      updateMicroTaskStatus(zone);
      zone.isCheckStableRunning = true;
      checkStable(zone);
      zone.isCheckStableRunning = false;
    });
  }
  if (zone.scheduleInRootZone) {
    Zone.root.run(() => {
      scheduleCheckStable();
    });
  } else {
    zone._outer.run(() => {
      scheduleCheckStable();
    });
  }
  updateMicroTaskStatus(zone);
}
function forkInnerZoneWithAngularBehavior(zone) {
  const delayChangeDetectionForEventsDelegate = () => {
    delayChangeDetectionForEvents(zone);
  };
  const instanceId = ngZoneInstanceId++;
  zone._inner = zone._inner.fork({
    name: 'angular',
    properties: {
      [isAngularZoneProperty]: true,
      [angularZoneInstanceIdProperty]: instanceId,
      [angularZoneInstanceIdProperty + instanceId]: true,
    },
    onInvokeTask: (delegate, current, target, task, applyThis, applyArgs) => {
      // Prevent triggering change detection when the flag is detected.
      if (shouldBeIgnoredByZone(applyArgs)) {
        return delegate.invokeTask(target, task, applyThis, applyArgs);
      }
      try {
        onEnter(zone);
        return delegate.invokeTask(target, task, applyThis, applyArgs);
      } finally {
        if (
          (zone.shouldCoalesceEventChangeDetection && task.type === 'eventTask') ||
          zone.shouldCoalesceRunChangeDetection
        ) {
          delayChangeDetectionForEventsDelegate();
        }
        onLeave(zone);
      }
    },
    onInvoke: (delegate, current, target, callback, applyThis, applyArgs, source) => {
      try {
        onEnter(zone);
        return delegate.invoke(target, callback, applyThis, applyArgs, source);
      } finally {
        if (
          zone.shouldCoalesceRunChangeDetection &&
          // Do not delay change detection when the task is the scheduler's tick.
          // We need to synchronously trigger the stability logic so that the
          // zone-based scheduler can prevent a duplicate ApplicationRef.tick
          // by first checking if the scheduler tick is running. This does seem a bit roundabout,
          // but we _do_ still want to trigger all the correct events when we exit the zone.run
          // (`onMicrotaskEmpty` and `onStable` _should_ emit; developers can have code which
          // relies on these events happening after change detection runs).
          // Note: `zone.callbackScheduled` is already in delayChangeDetectionForEventsDelegate
          // but is added here as well to prevent reads of applyArgs when not necessary
          !zone.callbackScheduled &&
          !isSchedulerTick(applyArgs)
        ) {
          delayChangeDetectionForEventsDelegate();
        }
        onLeave(zone);
      }
    },
    onHasTask: (delegate, current, target, hasTaskState) => {
      delegate.hasTask(target, hasTaskState);
      if (current === target) {
        // We are only interested in hasTask events which originate from our zone
        // (A child hasTask event is not interesting to us)
        if (hasTaskState.change == 'microTask') {
          zone._hasPendingMicrotasks = hasTaskState.microTask;
          updateMicroTaskStatus(zone);
          checkStable(zone);
        } else if (hasTaskState.change == 'macroTask') {
          zone.hasPendingMacrotasks = hasTaskState.macroTask;
        }
      }
    },
    onHandleError: (delegate, current, target, error) => {
      delegate.handleError(target, error);
      zone.runOutsideAngular(() => zone.onError.emit(error));
      return false;
    },
  });
}
function updateMicroTaskStatus(zone) {
  if (
    zone._hasPendingMicrotasks ||
    ((zone.shouldCoalesceEventChangeDetection || zone.shouldCoalesceRunChangeDetection) &&
      zone.callbackScheduled === true)
  ) {
    zone.hasPendingMicrotasks = true;
  } else {
    zone.hasPendingMicrotasks = false;
  }
}
function onEnter(zone) {
  zone._nesting++;
  if (zone.isStable) {
    zone.isStable = false;
    zone.onUnstable.emit(null);
  }
}
function onLeave(zone) {
  zone._nesting--;
  checkStable(zone);
}
/**
 * Provides a noop implementation of `NgZone` which does nothing. This zone requires explicit calls
 * to framework to perform rendering.
 */
export class NoopNgZone {
  hasPendingMicrotasks = false;
  hasPendingMacrotasks = false;
  isStable = true;
  onUnstable = new EventEmitter();
  onMicrotaskEmpty = new EventEmitter();
  onStable = new EventEmitter();
  onError = new EventEmitter();
  run(fn, applyThis, applyArgs) {
    return fn.apply(applyThis, applyArgs);
  }
  runGuarded(fn, applyThis, applyArgs) {
    return fn.apply(applyThis, applyArgs);
  }
  runOutsideAngular(fn) {
    return fn();
  }
  runTask(fn, applyThis, applyArgs, name) {
    return fn.apply(applyThis, applyArgs);
  }
}
function shouldBeIgnoredByZone(applyArgs) {
  return hasApplyArgsData(applyArgs, '__ignore_ng_zone__');
}
function isSchedulerTick(applyArgs) {
  return hasApplyArgsData(applyArgs, '__scheduler_tick__');
}
function hasApplyArgsData(applyArgs, key) {
  if (!Array.isArray(applyArgs)) {
    return false;
  }
  // We should only ever get 1 arg passed through to invokeTask.
  // Short circuit here incase that behavior changes.
  if (applyArgs.length !== 1) {
    return false;
  }
  return applyArgs[0]?.data?.[key] === true;
}
export function getNgZone(ngZoneToUse = 'zone.js', options) {
  if (ngZoneToUse === 'noop') {
    return new NoopNgZone();
  }
  if (ngZoneToUse === 'zone.js') {
    return new NgZone(options);
  }
  return ngZoneToUse;
}
//# sourceMappingURL=ng_zone.js.map
