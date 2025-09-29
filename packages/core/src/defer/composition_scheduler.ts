/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import { Injector } from '../di';
import { onIdle } from './idle_scheduler';
import { onTimer } from './timer_scheduler';

/**
 * Creates a composed scheduler that combines timer and idle callbacks.
 * The resulting scheduler will wait for the timer to complete before scheduling
 * the idle callback.
 * 
 * The composed scheduler maintains the following properties:
 * 1. The original callback is not executed until both the timer expires AND the browser is idle
 * 2. Both timer and idle callbacks are properly cleaned up when the cleanup function is called
 * 3. The cleanup function is safe to call at any time, whether the timer has fired or not
 *
 * @param delay The delay in milliseconds before scheduling the idle callback
 * @returns A scheduler function that can be used with defer triggers
 */
export function composeTimerAndIdle(delay: number) {
    return (callback: VoidFunction, injector: Injector) => {
        let idleCleanup: VoidFunction | null = null;
        let isDestroyed = false;

        // Schedule the timer first
        const timerCleanup = onTimer(delay)(() => {
            // When timer completes, schedule the idle callback if not destroyed
            if (!isDestroyed) {
                idleCleanup = onIdle(callback, injector);
            }
        }, injector);

        // Return a cleanup function that handles both timer and idle
        return () => {
            isDestroyed = true;
            timerCleanup();
            idleCleanup?.();
        };
    };
}