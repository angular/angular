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
 * ### Example
 *
 * ```
 * import {Component, NgZone} from '@angular/core';
 * import {NgIf} from '@angular/common';
 *
 * @Component({
 *   selector: 'ng-zone-demo'.
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
 *       // reenter the Angular zone and display done
 *       this._ngZone.run(() => {console.log('Outside Done!') });
 *     }}));
 *   }
 *
 *   _increaseProgress(doneCallback: () => void) {
 *     this.progress += 1;
 *     console.log(`Current progress: ${this.progress}%`);
 *
 *     if (this.progress < 100) {
 *       window.setTimeout(() => this._increaseProgress(doneCallback)), 10)
 *     } else {
 *       doneCallback();
 *     }
 *   }
 * }
 * ```
 *
 * @experimental
 */
export class NgZone {
  private outer: Zone;
  private inner: Zone;

  private _hasPendingMicrotasks: boolean = false;
  private _hasPendingMacrotasks: boolean = false;

  private _isStable = true;
  private _nesting: number = 0;
  private _onUnstable: EventEmitter<any> = new EventEmitter(false);
  private _onMicrotaskEmpty: EventEmitter<any> = new EventEmitter(false);
  private _onStable: EventEmitter<any> = new EventEmitter(false);
  private _onErrorEvents: EventEmitter<any> = new EventEmitter(false);

  constructor({enableLongStackTrace = false}) {
    if (typeof Zone == 'undefined') {
      throw new Error('Angular requires Zone.js prolyfill.');
    }

    Zone.assertZonePatched();

    this.outer = this.inner = Zone.current;

    if ((Zone as any)['wtfZoneSpec']) {
      this.inner = this.inner.fork((Zone as any)['wtfZoneSpec']);
    }

    if (enableLongStackTrace && (Zone as any)['longStackTraceZoneSpec']) {
      this.inner = this.inner.fork((Zone as any)['longStackTraceZoneSpec']);
    }

    this.forkInnerZoneWithAngularBehavior();
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
  run(fn: () => any): any { return this.inner.run(fn); }

  /**
   * Same as `run`, except that synchronous errors are caught and forwarded via `onError` and not
   * rethrown.
   */
  runGuarded(fn: () => any): any { return this.inner.runGuarded(fn); }

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
  runOutsideAngular(fn: () => any): any { return this.outer.run(fn); }

  /**
   * Notifies when code enters Angular Zone. This gets fired first on VM Turn.
   */
  get onUnstable(): EventEmitter<any> { return this._onUnstable; }

  /**
   * Notifies when there is no more microtasks enqueue in the current VM Turn.
   * This is a hint for Angular to do change detection, which may enqueue more microtasks.
   * For this reason this event can fire multiple times per VM Turn.
   */
  get onMicrotaskEmpty(): EventEmitter<any> { return this._onMicrotaskEmpty; }

  /**
   * Notifies when the last `onMicrotaskEmpty` has run and there are no more microtasks, which
   * implies we are about to relinquish VM turn.
   * This event gets called just once.
   */
  get onStable(): EventEmitter<any> { return this._onStable; }

  /**
   * Notify that an error has been delivered.
   */
  get onError(): EventEmitter<any> { return this._onErrorEvents; }

  /**
   * Whether there are no outstanding microtasks or macrotasks.
   */
  get isStable(): boolean { return this._isStable; }

  get hasPendingMicrotasks(): boolean { return this._hasPendingMicrotasks; }

  get hasPendingMacrotasks(): boolean { return this._hasPendingMacrotasks; }

  private checkStable() {
    if (this._nesting == 0 && !this._hasPendingMicrotasks && !this._isStable) {
      try {
        this._nesting++;
        this._onMicrotaskEmpty.emit(null);
      } finally {
        this._nesting--;
        if (!this._hasPendingMicrotasks) {
          try {
            this.runOutsideAngular(() => this._onStable.emit(null));
          } finally {
            this._isStable = true;
          }
        }
      }
    }
  }

  private forkInnerZoneWithAngularBehavior() {
    this.inner = this.inner.fork({
      name: 'angular',
      properties: <any>{'isAngularZone': true},
      onInvokeTask: (delegate: ZoneDelegate, current: Zone, target: Zone, task: Task,
                     applyThis: any, applyArgs: any): any => {
        try {
          this.onEnter();
          return delegate.invokeTask(target, task, applyThis, applyArgs);
        } finally {
          this.onLeave();
        }
      },


      onInvoke: (delegate: ZoneDelegate, current: Zone, target: Zone, callback: Function,
                 applyThis: any, applyArgs: any[], source: string): any => {
        try {
          this.onEnter();
          return delegate.invoke(target, callback, applyThis, applyArgs, source);
        } finally {
          this.onLeave();
        }
      },

      onHasTask:
          (delegate: ZoneDelegate, current: Zone, target: Zone, hasTaskState: HasTaskState) => {
            delegate.hasTask(target, hasTaskState);
            if (current === target) {
              // We are only interested in hasTask events which originate from our zone
              // (A child hasTask event is not interesting to us)
              if (hasTaskState.change == 'microTask') {
                this.setHasMicrotask(hasTaskState.microTask);
              } else if (hasTaskState.change == 'macroTask') {
                this.setHasMacrotask(hasTaskState.macroTask);
              }
            }
          },

      onHandleError: (delegate: ZoneDelegate, current: Zone, target: Zone, error: any): boolean => {
        delegate.handleError(target, error);
        this.triggerError(error);
        return false;
      }
    });
  }

  private onEnter() {
    this._nesting++;
    if (this._isStable) {
      this._isStable = false;
      this._onUnstable.emit(null);
    }
  }

  private onLeave() {
    this._nesting--;
    this.checkStable();
  }

  private setHasMicrotask(hasMicrotasks: boolean) {
    this._hasPendingMicrotasks = hasMicrotasks;
    this.checkStable();
  }

  private setHasMacrotask(hasMacrotasks: boolean) { this._hasPendingMacrotasks = hasMacrotasks; }

  private triggerError(error: any) { this._onErrorEvents.emit(error); }
}
