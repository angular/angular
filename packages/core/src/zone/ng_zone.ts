/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

// Needed for the global `Zone` ambient types to be available.
import type {} from 'zone.js';

import {SCHEDULE_IN_ROOT_ZONE_DEFAULT} from '../change_detection/scheduling/flags';
import {RuntimeError, RuntimeErrorCode} from '../errors';
import {EventEmitter} from '../event_emitter';
import {scheduleCallbackWithRafRace} from '../util/callback_scheduler';
import {noop} from '../util/noop';

import {AsyncStackTaggingZoneSpec} from './async-stack-tagging';
import {Subject} from 'rxjs';

// The below is needed as otherwise a number of targets fail in G3 due to:
// ERROR - [JSC_UNDEFINED_VARIABLE] variable Zone is undeclared
declare const Zone: any;

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
  readonly hasPendingMacrotasks: boolean = false;
  readonly hasPendingMicrotasks: boolean = false;

  /**
   * Whether there are no outstanding microtasks or macrotasks.
   */
  readonly isStable: boolean = true;

  /**
   * Notifies when code enters Angular Zone. This gets fired first on VM Turn.
   */
  readonly onUnstable: Subject<any> = new Subject();

  /**
   * Notifies when there is no more microtasks enqueued in the current VM Turn.
   * This is a hint for Angular to do change detection, which may enqueue more microtasks.
   * For this reason this event can fire multiple times per VM Turn.
   */
  readonly onMicrotaskEmpty: Subject<any> = new Subject();

  /**
   * Notifies when the last `onMicrotaskEmpty` has run and there are no more microtasks, which
   * implies we are about to relinquish VM turn.
   * This event gets called just once.
   */
  readonly onStable: Subject<any> = new Subject();

  /**
   * Notifies that an error has been delivered.
   */
  readonly onError: Subject<any> = new Subject();

  constructor(options: {
    enableLongStackTrace?: boolean;
    shouldCoalesceEventChangeDetection?: boolean;
    shouldCoalesceRunChangeDetection?: boolean;
  }) {
    const {
      enableLongStackTrace = false,
      shouldCoalesceEventChangeDetection = false,
      shouldCoalesceRunChangeDetection = false,
      scheduleInRootZone = SCHEDULE_IN_ROOT_ZONE_DEFAULT,
    } = options as InternalNgZoneOptions;

    if (typeof Zone == 'undefined') {
      throw new RuntimeError(
        RuntimeErrorCode.MISSING_ZONEJS,
        ngDevMode && `In this configuration Angular requires Zone.js`,
      );
    }

    Zone.assertZonePatched();
    const self = this as any as NgZonePrivate;
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

    if ((Zone as any)['TaskTrackingZoneSpec']) {
      self._inner = self._inner.fork(new ((Zone as any)['TaskTrackingZoneSpec'] as any)());
    }

    if (enableLongStackTrace && (Zone as any)['longStackTraceZoneSpec']) {
      self._inner = self._inner.fork((Zone as any)['longStackTraceZoneSpec']);
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
  static isInAngularZone(): boolean {
    // Zone needs to be checked, because this method might be called even when NoopNgZone is used.
    return typeof Zone !== 'undefined' && Zone.current.get(isAngularZoneProperty) === true;
  }

  /**
    Assures that the method is called within the Angular Zone, otherwise throws an error.
  */
  static assertInAngularZone(): void {
    if (!NgZone.isInAngularZone()) {
      throw new RuntimeError(
        RuntimeErrorCode.UNEXPECTED_ZONE_STATE,
        ngDevMode && 'Expected to be in Angular Zone, but it is not!',
      );
    }
  }

  /**
    Assures that the method is called outside of the Angular Zone, otherwise throws an error.
  */
  static assertNotInAngularZone(): void {
    if (NgZone.isInAngularZone()) {
      throw new RuntimeError(
        RuntimeErrorCode.UNEXPECTED_ZONE_STATE,
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
  run<T>(fn: (...args: any[]) => T, applyThis?: any, applyArgs?: any[]): T {
    return (this as any as NgZonePrivate)._inner.run(fn, applyThis, applyArgs);
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
  runTask<T>(fn: (...args: any[]) => T, applyThis?: any, applyArgs?: any[], name?: string): T {
    const zone = (this as any as NgZonePrivate)._inner;
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
  runGuarded<T>(fn: (...args: any[]) => T, applyThis?: any, applyArgs?: any[]): T {
    return (this as any as NgZonePrivate)._inner.runGuarded(fn, applyThis, applyArgs);
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
  runOutsideAngular<T>(fn: (...args: any[]) => T): T {
    return (this as any as NgZonePrivate)._outer.run(fn);
  }
}

const EMPTY_PAYLOAD = {};

export interface NgZonePrivate extends NgZone {
  _outer: Zone;
  _inner: Zone;
  _nesting: number;
  _hasPendingMicrotasks: boolean;

  hasPendingMacrotasks: boolean;
  hasPendingMicrotasks: boolean;
  callbackScheduled: boolean;
  /**
   * A flag to indicate if NgZone is currently inside
   * checkStable and to prevent re-entry. The flag is
   * needed because it is possible to invoke the change
   * detection from within change detection leading to
   * incorrect behavior.
   *
   * For detail, please refer here,
   * https://github.com/angular/angular/pull/40540
   */
  isCheckStableRunning: boolean;
  isStable: boolean;
  /**
   * Optionally specify coalescing event change detections or not.
   * Consider the following case.
   *
   * <div (click)="doSomething()">
   *   <button (click)="doSomethingElse()"></button>
   * </div>
   *
   * When button is clicked, because of the event bubbling, both
   * event handlers will be called and 2 change detections will be
   * triggered. We can coalesce such kind of events to trigger
   * change detection only once.
   *
   * By default, this option will be false. So the events will not be
   * coalesced and the change detection will be triggered multiple times.
   * And if this option be set to true, the change detection will be
   * triggered async by scheduling it in an animation frame. So in the case above,
   * the change detection will only be trigged once.
   */
  shouldCoalesceEventChangeDetection: boolean;
  /**
   * Optionally specify if `NgZone#run()` method invocations should be coalesced
   * into a single change detection.
   *
   * Consider the following case.
   *
   * for (let i = 0; i < 10; i ++) {
   *   ngZone.run(() => {
   *     // do something
   *   });
   * }
   *
   * This case triggers the change detection multiple times.
   * With ngZoneRunCoalescing options, all change detections in an event loops trigger only once.
   * In addition, the change detection executes in requestAnimation.
   *
   */
  shouldCoalesceRunChangeDetection: boolean;

  /**
   * Whether to schedule the coalesced change detection in the root zone
   */
  scheduleInRootZone: boolean;
}

function checkStable(zone: NgZonePrivate) {
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
      zone.onMicrotaskEmpty.next(null);
    } finally {
      zone._nesting--;
      if (!zone.hasPendingMicrotasks) {
        try {
          zone.runOutsideAngular(() => zone.onStable.next(null));
        } finally {
          zone.isStable = true;
        }
      }
    }
  }
}

function delayChangeDetectionForEvents(zone: NgZonePrivate) {
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

function forkInnerZoneWithAngularBehavior(zone: NgZonePrivate) {
  const delayChangeDetectionForEventsDelegate = () => {
    delayChangeDetectionForEvents(zone);
  };
  const instanceId = ngZoneInstanceId++;
  zone._inner = zone._inner.fork({
    name: 'angular',
    properties: <any>{
      [isAngularZoneProperty]: true,
      [angularZoneInstanceIdProperty]: instanceId,
      [angularZoneInstanceIdProperty + instanceId]: true,
    },
    onInvokeTask: (
      delegate: ZoneDelegate,
      current: Zone,
      target: Zone,
      task: Task,
      applyThis: any,
      applyArgs: any,
    ): any => {
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

    onInvoke: (
      delegate: ZoneDelegate,
      current: Zone,
      target: Zone,
      callback: Function,
      applyThis: any,
      applyArgs?: any[],
      source?: string,
    ): any => {
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

    onHasTask: (
      delegate: ZoneDelegate,
      current: Zone,
      target: Zone,
      hasTaskState: HasTaskState,
    ) => {
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

    onHandleError: (delegate: ZoneDelegate, current: Zone, target: Zone, error: any): boolean => {
      delegate.handleError(target, error);
      zone.runOutsideAngular(() => zone.onError.next(error));
      return false;
    },
  });
}

function updateMicroTaskStatus(zone: NgZonePrivate) {
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

function onEnter(zone: NgZonePrivate) {
  zone._nesting++;
  if (zone.isStable) {
    zone.isStable = false;
    zone.onUnstable.next(null);
  }
}

function onLeave(zone: NgZonePrivate) {
  zone._nesting--;
  checkStable(zone);
}

/**
 * Provides a noop implementation of `NgZone` which does nothing. This zone requires explicit calls
 * to framework to perform rendering.
 */
export class NoopNgZone implements NgZone {
  readonly hasPendingMicrotasks = false;
  readonly hasPendingMacrotasks = false;
  readonly isStable = true;
  readonly onUnstable = new EventEmitter<any>();
  readonly onMicrotaskEmpty = new EventEmitter<any>();
  readonly onStable = new EventEmitter<any>();
  readonly onError = new EventEmitter<any>();

  run<T>(fn: (...args: any[]) => T, applyThis?: any, applyArgs?: any): T {
    return fn.apply(applyThis, applyArgs);
  }

  runGuarded<T>(fn: (...args: any[]) => any, applyThis?: any, applyArgs?: any): T {
    return fn.apply(applyThis, applyArgs);
  }

  runOutsideAngular<T>(fn: (...args: any[]) => T): T {
    return fn();
  }

  runTask<T>(fn: (...args: any[]) => T, applyThis?: any, applyArgs?: any, name?: string): T {
    return fn.apply(applyThis, applyArgs);
  }
}

function shouldBeIgnoredByZone(applyArgs: unknown): boolean {
  return hasApplyArgsData(applyArgs, '__ignore_ng_zone__');
}

function isSchedulerTick(applyArgs: unknown): boolean {
  return hasApplyArgsData(applyArgs, '__scheduler_tick__');
}

function hasApplyArgsData(applyArgs: unknown, key: string) {
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

// Set of options recognized by the NgZone.
export interface InternalNgZoneOptions {
  enableLongStackTrace?: boolean;
  shouldCoalesceEventChangeDetection?: boolean;
  shouldCoalesceRunChangeDetection?: boolean;
  scheduleInRootZone?: boolean;
}

export function getNgZone(
  ngZoneToUse: NgZone | 'zone.js' | 'noop' = 'zone.js',
  options: InternalNgZoneOptions,
): NgZone {
  if (ngZoneToUse === 'noop') {
    return new NoopNgZone();
  }
  if (ngZoneToUse === 'zone.js') {
    return new NgZone(options);
  }
  return ngZoneToUse;
}
