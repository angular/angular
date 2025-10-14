/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { Injector } from '../di';
import { NgZone } from '../zone';
/**
 * Returns a function that captures a provided delay.
 * Invoking the returned function schedules a trigger.
 */
export declare function onTimer(delay: number): (callback: VoidFunction, injector: Injector) => () => void;
/**
 * Schedules a callback to be invoked after a given timeout.
 *
 * @param delay A number of ms to wait until firing a callback.
 * @param callback A function to be invoked after a timeout.
 * @param injector injector for the app.
 */
export declare function scheduleTimerTrigger(delay: number, callback: VoidFunction, injector: Injector): () => void;
/**
 * Helper service to schedule `setTimeout`s for batches of defer blocks,
 * to avoid calling `setTimeout` for each defer block (e.g. if defer blocks
 * are created inside a for loop).
 */
export declare class TimerScheduler {
    executingCallbacks: boolean;
    timeoutId: number | null;
    invokeTimerAt: number | null;
    current: Array<number | VoidFunction>;
    deferred: Array<number | VoidFunction>;
    add(delay: number, callback: VoidFunction, ngZone: NgZone): void;
    remove(callback: VoidFunction): void;
    private addToQueue;
    private removeFromQueue;
    private scheduleTimer;
    private clearTimeout;
    ngOnDestroy(): void;
    /** @nocollapse */
    static ɵprov: unknown;
}
