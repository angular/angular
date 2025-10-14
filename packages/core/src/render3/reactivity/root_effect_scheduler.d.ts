/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
/**
 * Abstraction that encompasses any kind of effect that can be scheduled.
 */
export interface SchedulableEffect {
    run(): void;
    zone: {
        run<T>(fn: () => T): T;
    } | null;
    dirty: boolean;
}
/**
 * A scheduler which manages the execution of effects.
 */
export declare abstract class EffectScheduler {
    abstract add(e: SchedulableEffect): void;
    /**
     * Schedule the given effect to be executed at a later time.
     *
     * It is an error to attempt to execute any effects synchronously during a scheduling operation.
     */
    abstract schedule(e: SchedulableEffect): void;
    /**
     * Run any scheduled effects.
     */
    abstract flush(): void;
    /** Remove a scheduled effect */
    abstract remove(e: SchedulableEffect): void;
    /** @nocollapse */
    static ɵprov: unknown;
}
/**
 * A wrapper around `ZoneAwareQueueingScheduler` that schedules flushing via the microtask queue
 * when.
 */
export declare class ZoneAwareEffectScheduler implements EffectScheduler {
    private dirtyEffectCount;
    private queues;
    add(handle: SchedulableEffect): void;
    schedule(handle: SchedulableEffect): void;
    remove(handle: SchedulableEffect): void;
    private enqueue;
    /**
     * Run all scheduled effects.
     *
     * Execution order of effects within the same zone is guaranteed to be FIFO, but there is no
     * ordering guarantee between effects scheduled in different zones.
     */
    flush(): void;
    private flushQueue;
}
