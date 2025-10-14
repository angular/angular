/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { ReactiveNode, SIGNAL } from './graph';
/**
 * A cleanup function that can be optionally registered from the watch logic. If registered, the
 * cleanup logic runs before the next watch execution.
 */
export type WatchCleanupFn = () => void;
/**
 * A callback passed to the watch function that makes it possible to register cleanup logic.
 */
export type WatchCleanupRegisterFn = (cleanupFn: WatchCleanupFn) => void;
export interface Watch {
    notify(): void;
    /**
     * Execute the reactive expression in the context of this `Watch` consumer.
     *
     * Should be called by the user scheduling algorithm when the provided
     * `schedule` hook is called by `Watch`.
     */
    run(): void;
    cleanup(): void;
    /**
     * Destroy the watcher:
     * - disconnect it from the reactive graph;
     * - mark it as destroyed so subsequent run and notify operations are noop.
     */
    destroy(): void;
    [SIGNAL]: WatchNode;
}
export interface WatchNode extends ReactiveNode {
    fn: ((onCleanup: WatchCleanupRegisterFn) => void) | null;
    schedule: ((watch: Watch) => void) | null;
    cleanupFn: WatchCleanupFn;
    ref: Watch;
}
export declare function createWatch(fn: (onCleanup: WatchCleanupRegisterFn) => void, schedule: (watch: Watch) => void, allowSignalWrites: boolean): Watch;
