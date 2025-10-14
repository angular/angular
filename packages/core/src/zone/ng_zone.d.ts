/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { EventEmitter } from '../event_emitter';
export declare const angularZoneInstanceIdProperty: string;
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
export declare class NgZone {
    readonly hasPendingMacrotasks: boolean;
    readonly hasPendingMicrotasks: boolean;
    /**
     * Whether there are no outstanding microtasks or macrotasks.
     */
    readonly isStable: boolean;
    /**
     * Notifies when code enters Angular Zone. This gets fired first on VM Turn.
     */
    readonly onUnstable: EventEmitter<any>;
    /**
     * Notifies when there is no more microtasks enqueued in the current VM Turn.
     * This is a hint for Angular to do change detection, which may enqueue more microtasks.
     * For this reason this event can fire multiple times per VM Turn.
     */
    readonly onMicrotaskEmpty: EventEmitter<any>;
    /**
     * Notifies when the last `onMicrotaskEmpty` has run and there are no more microtasks, which
     * implies we are about to relinquish VM turn.
     * This event gets called just once.
     */
    readonly onStable: EventEmitter<any>;
    /**
     * Notifies that an error has been delivered.
     */
    readonly onError: EventEmitter<any>;
    constructor(options: {
        enableLongStackTrace?: boolean;
        shouldCoalesceEventChangeDetection?: boolean;
        shouldCoalesceRunChangeDetection?: boolean;
    });
    /**
      This method checks whether the method call happens within an Angular Zone instance.
    */
    static isInAngularZone(): boolean;
    /**
      Assures that the method is called within the Angular Zone, otherwise throws an error.
    */
    static assertInAngularZone(): void;
    /**
      Assures that the method is called outside of the Angular Zone, otherwise throws an error.
    */
    static assertNotInAngularZone(): void;
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
    run<T>(fn: (...args: any[]) => T, applyThis?: any, applyArgs?: any[]): T;
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
    runTask<T>(fn: (...args: any[]) => T, applyThis?: any, applyArgs?: any[], name?: string): T;
    /**
     * Same as `run`, except that synchronous errors are caught and forwarded via `onError` and not
     * rethrown.
     */
    runGuarded<T>(fn: (...args: any[]) => T, applyThis?: any, applyArgs?: any[]): T;
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
    runOutsideAngular<T>(fn: (...args: any[]) => T): T;
}
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
/**
 * Provides a noop implementation of `NgZone` which does nothing. This zone requires explicit calls
 * to framework to perform rendering.
 */
export declare class NoopNgZone implements NgZone {
    readonly hasPendingMicrotasks = false;
    readonly hasPendingMacrotasks = false;
    readonly isStable = true;
    readonly onUnstable: EventEmitter<any>;
    readonly onMicrotaskEmpty: EventEmitter<any>;
    readonly onStable: EventEmitter<any>;
    readonly onError: EventEmitter<any>;
    run<T>(fn: (...args: any[]) => T, applyThis?: any, applyArgs?: any): T;
    runGuarded<T>(fn: (...args: any[]) => any, applyThis?: any, applyArgs?: any): T;
    runOutsideAngular<T>(fn: (...args: any[]) => T): T;
    runTask<T>(fn: (...args: any[]) => T, applyThis?: any, applyArgs?: any, name?: string): T;
}
export interface InternalNgZoneOptions {
    enableLongStackTrace?: boolean;
    shouldCoalesceEventChangeDetection?: boolean;
    shouldCoalesceRunChangeDetection?: boolean;
    scheduleInRootZone?: boolean;
}
export declare function getNgZone(ngZoneToUse: (NgZone | "zone.js" | "noop") | undefined, options: InternalNgZoneOptions): NgZone;
