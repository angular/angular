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
 * Helper function to schedule a callback to be invoked when a browser becomes idle.
 *
 * @param callback A function to be invoked when a browser becomes idle.
 * @param injector injector for the app
 */
export declare function onIdle(callback: VoidFunction, injector: Injector): () => void;
/**
 * Helper service to schedule `requestIdleCallback`s for batches of defer blocks,
 * to avoid calling `requestIdleCallback` for each defer block (e.g. if
 * defer blocks are defined inside a for loop).
 */
export declare class IdleScheduler {
    executingCallbacks: boolean;
    idleId: number | null;
    current: Set<VoidFunction>;
    deferred: Set<VoidFunction>;
    ngZone: NgZone;
    requestIdleCallbackFn: typeof setTimeout | typeof requestIdleCallback;
    cancelIdleCallbackFn: typeof cancelIdleCallback;
    add(callback: VoidFunction): void;
    remove(callback: VoidFunction): void;
    private scheduleIdleCallback;
    private cancelIdleCallback;
    ngOnDestroy(): void;
    /** @nocollapse */
    static ɵprov: unknown;
}
