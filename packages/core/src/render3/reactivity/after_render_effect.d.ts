/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { type EffectCleanupRegisterFn } from './effect';
import { type Signal } from '../reactivity/api';
import { TracingSnapshot } from '../../application/tracing';
import { ChangeDetectionScheduler } from '../../change_detection/scheduling/zoneless_scheduling';
import { Injector } from '../../di/injector';
import { AfterRenderPhase, type AfterRenderRef } from '../after_render/api';
import { type AfterRenderOptions } from '../after_render/hooks';
import { AfterRenderImpl, AfterRenderSequence } from '../after_render/manager';
import { LView } from '../interfaces/view';
/** Callback type for an `afterRenderEffect` phase effect */
type AfterRenderPhaseEffectHook = (...args: [onCleanup: EffectCleanupRegisterFn] | [previousPhaseValue: unknown, onCleanup: EffectCleanupRegisterFn]) => unknown;
/**
 * An `AfterRenderSequence` that manages an `afterRenderEffect`'s phase effects.
 */
export declare class AfterRenderEffectSequence extends AfterRenderSequence {
    readonly scheduler: ChangeDetectionScheduler;
    /**
     * While this sequence is executing, this tracks the last phase which was called by the
     * `afterRender` machinery.
     *
     * When a phase effect is marked dirty, this is used to determine whether it's already run or not.
     */
    lastPhase: AfterRenderPhase | null;
    /**
     * The reactive nodes for each phase, if a phase effect is defined for that phase.
     *
     * These are initialized to `undefined` but set in the constructor.
     */
    private readonly nodes;
    constructor(impl: AfterRenderImpl, effectHooks: Array<AfterRenderPhaseEffectHook | undefined>, view: LView | undefined, scheduler: ChangeDetectionScheduler, injector: Injector, snapshot?: TracingSnapshot | null);
    afterRun(): void;
    destroy(): void;
}
/**
 * An argument list containing the first non-never type in the given type array, or an empty
 * argument list if there are no non-never types in the type array.
 */
export type ɵFirstAvailableSignal<T extends unknown[]> = T extends [infer H, ...infer R] ? [H] extends [never] ? ɵFirstAvailableSignal<R> : [Signal<H>] : [];
/**
 * Register an effect that, when triggered, is invoked when the application finishes rendering, during the
 * `mixedReadWrite` phase.
 *
 * <div class="docs-alert docs-alert-critical">
 *
 * You should prefer specifying an explicit phase for the effect instead, or you risk significant
 * performance degradation.
 *
 * </div>
 *
 * Note that callback-based `afterRenderEffect`s will run
 * - in the order it they are registered
 * - only when dirty
 * - on browser platforms only
 * - during the `mixedReadWrite` phase
 *
 * <div class="docs-alert docs-alert-important">
 *
 * Components are not guaranteed to be [hydrated](guide/hydration) before the callback runs.
 * You must use caution when directly reading or writing the DOM and layout.
 *
 * </div>
 *
 * @param callback An effect callback function to register
 * @param options Options to control the behavior of the callback
 *
 * @publicApi
 */
export declare function afterRenderEffect(callback: (onCleanup: EffectCleanupRegisterFn) => void, options?: AfterRenderOptions): AfterRenderRef;
/**
 * Register effects that, when triggered, are invoked when the application finishes rendering,
 * during the specified phases. The available phases are:
 * - `earlyRead`
 *   Use this phase to **read** from the DOM before a subsequent `write` callback, for example to
 *   perform custom layout that the browser doesn't natively support. Prefer the `read` phase if
 *   reading can wait until after the write phase. **Never** write to the DOM in this phase.
 * - `write`
 *    Use this phase to **write** to the DOM. **Never** read from the DOM in this phase.
 * - `mixedReadWrite`
 *    Use this phase to read from and write to the DOM simultaneously. **Never** use this phase if
 *    it is possible to divide the work among the other phases instead.
 * - `read`
 *    Use this phase to **read** from the DOM. **Never** write to the DOM in this phase.
 *
 * <div class="docs-alert docs-alert-critical">
 *
 * You should prefer using the `read` and `write` phases over the `earlyRead` and `mixedReadWrite`
 * phases when possible, to avoid performance degradation.
 *
 * </div>
 *
 * Note that:
 * - Effects run in the following phase order, only when dirty through signal dependencies:
 *   1. `earlyRead`
 *   2. `write`
 *   3. `mixedReadWrite`
 *   4. `read`
 * - `afterRenderEffect`s in the same phase run in the order they are registered.
 * - `afterRenderEffect`s run on browser platforms only, they will not run on the server.
 * - `afterRenderEffect`s will run at least once.
 *
 * The first phase callback to run as part of this spec will receive no parameters. Each
 * subsequent phase callback in this spec will receive the return value of the previously run
 * phase callback as a `Signal`. This can be used to coordinate work across multiple phases.
 *
 * Angular is unable to verify or enforce that phases are used correctly, and instead
 * relies on each developer to follow the guidelines documented for each value and
 * carefully choose the appropriate one, refactoring their code if necessary. By doing
 * so, Angular is better able to minimize the performance degradation associated with
 * manual DOM access, ensuring the best experience for the end users of your application
 * or library.
 *
 * <div class="docs-alert docs-alert-important">
 *
 * Components are not guaranteed to be [hydrated](guide/hydration) before the callback runs.
 * You must use caution when directly reading or writing the DOM and layout.
 *
 * </div>
 *
 * @param spec The effect functions to register
 * @param options Options to control the behavior of the effects
 *
 * @usageNotes
 *
 * Use `afterRenderEffect` to create effects that will read or write from the DOM and thus should
 * run after rendering.
 *
 * @publicApi
 */
export declare function afterRenderEffect<E = never, W = never, M = never>(spec: {
    earlyRead?: (onCleanup: EffectCleanupRegisterFn) => E;
    write?: (...args: [...ɵFirstAvailableSignal<[E]>, EffectCleanupRegisterFn]) => W;
    mixedReadWrite?: (...args: [...ɵFirstAvailableSignal<[W, E]>, EffectCleanupRegisterFn]) => M;
    read?: (...args: [...ɵFirstAvailableSignal<[M, W, E]>, EffectCleanupRegisterFn]) => void;
}, options?: AfterRenderOptions): AfterRenderRef;
export {};
