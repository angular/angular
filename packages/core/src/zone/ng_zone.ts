/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {EventEmitter} from '../event_emitter';

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
 * ```
 * import {Component, NgZone} from '@angular/core';
 * import {NgIf} from '@angular/common';
 *
 * @Component({
 *   selector: 'ng-zone-demo',
 *   template: `
 *     <h2>Demo: NgZone</h2>
 *
 *     <p>Progress: {{progress}}%</p>
 *     <p *ngIf="progress >= 100">Done processing {{label}} of Angular zone!</p>
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
  readonly hasPendingMicrotasks: boolean = false;
  readonly hasPendingMacrotasks: boolean = false;

  /**
   * Whether there are no outstanding microtasks or macrotasks.
   */
  readonly isStable: boolean = true;

  /**
   * Notifies when code enters Angular Zone. This gets fired first on VM Turn.
   */
  readonly onUnstable: EventEmitter<any> = new EventEmitter(false);

  /**
   * Notifies when there is no more microtasks enqueued in the current VM Turn.
   * This is a hint for Angular to do change detection, which may enqueue more microtasks.
   * For this reason this event can fire multiple times per VM Turn.
   */
  readonly onMicrotaskEmpty: EventEmitter<any> = new EventEmitter(false);

  /**
   * Notifies when the last `onMicrotaskEmpty` has run and there are no more microtasks, which
   * implies we are about to relinquish VM turn.
   * This event gets called just once.
   */
  readonly onStable: EventEmitter<any> = new EventEmitter(false);

  /**
   * Notifies that an error has been delivered.
   */
  readonly onError: EventEmitter<any> = new EventEmitter(false);

  constructor({enableLongStackTrace = false}) {
    if (typeof Zone == 'undefined') {
      throw new Error(`In this configuration Angular requires Zone.js`);
    }

    Zone.assertZonePatched();
    const self = this as any as NgZonePrivate;
    self._nesting = 0;

    self._outer = self._inner = Zone.current;

    if ((Zone as any)['wtfZoneSpec']) {
      self._inner = self._inner.fork((Zone as any)['wtfZoneSpec']);
    }

    if ((Zone as any)['TaskTrackingZoneSpec']) {
      self._inner = self._inner.fork(new ((Zone as any)['TaskTrackingZoneSpec'] as any));
    }

    if (enableLongStackTrace && (Zone as any)['longStackTraceZoneSpec']) {
      self._inner = self._inner.fork((Zone as any)['longStackTraceZoneSpec']);
    }

    forkInnerZoneWithAngularBehavior(self);
  }

  static isInAngularZone(): boolean { return Zone.current.get('isAngularZone') === true; }

  static assertInAngularZone(): void {
    if (!NgZone.isInAngularZone()) {
      throw new Error('Expected to be in Angular Zone, but it is not!');
    }
  }

  static assertNotInAngularZone(): void {
    if (NgZone.isInAngularZone()) {
      throw new Error('Expected to not be in Angular Zone, but it is!');
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
    return (this as any as NgZonePrivate)._inner.run(fn, applyThis, applyArgs) as T;
  }

  /**
   * Executes the `fn` function synchronously within the Angular zone as a task and returns value
   * returned by the function.
   *
   * Running functions via `run` allows you to reenter Angular zone from a task that was executed
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
      return zone.runTask(task, applyThis, applyArgs) as T;
    } finally {
      zone.cancelTask(task);
    }
  }

  /**
   * Same as `run`, except that synchronous errors are caught and forwarded via `onError` and not
   * rethrown.
   */
  runGuarded<T>(fn: (...args: any[]) => T, applyThis?: any, applyArgs?: any[]): T {
    return (this as any as NgZonePrivate)._inner.runGuarded(fn, applyThis, applyArgs) as T;
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
    return (this as any as NgZonePrivate)._outer.run(fn) as T;
  }
}

function noop() {}
const EMPTY_PAYLOAD = {};


interface NgZonePrivate extends NgZone {
  _outer: Zone;
  _inner: Zone;
  _nesting: number;

  hasPendingMicrotasks: boolean;
  hasPendingMacrotasks: boolean;
  isStable: boolean;
}

function checkStable(zone: NgZonePrivate) {
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

function forkInnerZoneWithAngularBehavior(zone: NgZonePrivate) {
  zone._inner = zone._inner.fork({
    name: 'angular',
    properties: <any>{'isAngularZone': true},
    onInvokeTask: (delegate: ZoneDelegate, current: Zone, target: Zone, task: Task, applyThis: any,
                   applyArgs: any): any => {
      try {
        onEnter(zone);
        return delegate.invokeTask(target, task, applyThis, applyArgs);
      } finally {
        onLeave(zone);
      }
    },


    onInvoke: (delegate: ZoneDelegate, current: Zone, target: Zone, callback: Function,
               applyThis: any, applyArgs: any[], source: string): any => {
      try {
        onEnter(zone);
        return delegate.invoke(target, callback, applyThis, applyArgs, source);
      } finally {
        onLeave(zone);
      }
    },

    onHasTask:
        (delegate: ZoneDelegate, current: Zone, target: Zone, hasTaskState: HasTaskState) => {
          delegate.hasTask(target, hasTaskState);
          if (current === target) {
            // We are only interested in hasTask events which originate from our zone
            // (A child hasTask event is not interesting to us)
            if (hasTaskState.change == 'microTask') {
              zone.hasPendingMicrotasks = hasTaskState.microTask;
              checkStable(zone);
            } else if (hasTaskState.change == 'macroTask') {
              zone.hasPendingMacrotasks = hasTaskState.macroTask;
            }
          }
        },

    onHandleError: (delegate: ZoneDelegate, current: Zone, target: Zone, error: any): boolean => {
      delegate.handleError(target, error);
      zone.runOutsideAngular(() => zone.onError.emit(error));
      return false;
    }
  });
}

function onEnter(zone: NgZonePrivate) {
  zone._nesting++;
  if (zone.isStable) {
    zone.isStable = false;
    zone.onUnstable.emit(null);
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
  readonly hasPendingMicrotasks: boolean = false;
  readonly hasPendingMacrotasks: boolean = false;
  readonly isStable: boolean = true;
  readonly onUnstable: EventEmitter<any> = new EventEmitter();
  readonly onMicrotaskEmpty: EventEmitter<any> = new EventEmitter();
  readonly onStable: EventEmitter<any> = new EventEmitter();
  readonly onError: EventEmitter<any> = new EventEmitter();

  run(fn: () => any): any { return fn(); }

  runGuarded(fn: () => any): any { return fn(); }

  runOutsideAngular(fn: () => any): any { return fn(); }

  runTask<T>(fn: () => any): any { return fn(); }
}
