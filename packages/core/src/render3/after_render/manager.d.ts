/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { TracingSnapshot } from '../../application/tracing';
import { type DestroyRef } from '../../linker/destroy_ref';
import { LView } from '../interfaces/view';
import { AfterRenderPhase, AfterRenderRef } from './api';
export declare class AfterRenderManager {
    impl: AfterRenderImpl | null;
    execute(): void;
    /** @nocollapse */
    static ɵprov: unknown;
}
export declare const AFTER_RENDER_PHASES: AfterRenderPhase[];
export declare class AfterRenderImpl {
    private readonly ngZone;
    private readonly scheduler;
    private readonly errorHandler;
    /** Current set of active sequences. */
    private readonly sequences;
    /** Tracks registrations made during the current set of executions. */
    private readonly deferredRegistrations;
    /** Whether the `AfterRenderManager` is currently executing hooks. */
    executing: boolean;
    constructor();
    /**
     * Run the sequence of phases of hooks, once through. As a result of executing some hooks, more
     * might be scheduled.
     */
    execute(): void;
    register(sequence: AfterRenderSequence): void;
    addSequence(sequence: AfterRenderSequence): void;
    unregister(sequence: AfterRenderSequence): void;
    protected maybeTrace<T>(fn: () => T, snapshot: TracingSnapshot | null): T;
    /** @nocollapse */
    static ɵprov: unknown;
}
export type AfterRenderHook = (value?: unknown) => unknown;
export type AfterRenderHooks = [
    AfterRenderHook | undefined,
    AfterRenderHook | undefined,
    AfterRenderHook | undefined,
    AfterRenderHook | undefined
];
export declare class AfterRenderSequence implements AfterRenderRef {
    readonly impl: AfterRenderImpl;
    readonly hooks: AfterRenderHooks;
    readonly view: LView | undefined;
    once: boolean;
    snapshot: TracingSnapshot | null;
    /**
     * Whether this sequence errored or was destroyed during this execution, and hooks should no
     * longer run for it.
     */
    erroredOrDestroyed: boolean;
    /**
     * The value returned by the last hook execution (if any), ready to be pipelined into the next
     * one.
     */
    pipelinedValue: unknown;
    private unregisterOnDestroy;
    constructor(impl: AfterRenderImpl, hooks: AfterRenderHooks, view: LView | undefined, once: boolean, destroyRef: DestroyRef | null, snapshot?: TracingSnapshot | null);
    afterRun(): void;
    destroy(): void;
}
