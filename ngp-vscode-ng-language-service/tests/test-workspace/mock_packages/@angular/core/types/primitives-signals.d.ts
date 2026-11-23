/**
 * @license Angular v22.3.0-next.0+sha-95e8dec
 * (c) 2010-2026 Google LLC. https://angular.dev/
 * License: MIT
 */

import { ReactiveNode, ValueEqualityFn, SIGNAL } from './_formatter-chunk.js';
export { REACTIVE_NODE, Reactive, ReactiveHookFn, ReactiveNodeKind, Version, consumerAfterComputation, consumerBeforeComputation, consumerDestroy, consumerMarkDirty, consumerPollProducersForChange, defaultEquals, finalizeConsumerAfterComputation, getActiveConsumer, installDevToolsSignalFormatter, isInNotificationPhase, isReactive, producerAccessed, producerIncrementEpoch, producerMarkClean, producerNotifyConsumers, producerUpdateValueVersion, producerUpdatesAllowed, resetConsumerBeforeComputation, runPostProducerCreatedFn, setActiveConsumer, setPostProducerCreatedFn } from './_formatter-chunk.js';
import { SignalNode } from './_effect-chunk.js';
export { BASE_EFFECT_NODE, BaseEffectNode, SIGNAL_NODE, SignalGetter, createSignal, runEffect, runPostSignalSetFn, setPostSignalSetFn, signalGetFn, signalSetFn, signalUpdateFn } from './_effect-chunk.js';
export { setAlternateWeakRefImpl } from './_weak_ref-chunk.js';

/**
 * A computation, which derives a value from a declarative reactive expression.
 *
 * `Computed`s are both producers and consumers of reactivity.
 */
interface ComputedNode<T> extends ReactiveNode {
    /**
     * Current value of the computation, or one of the sentinel values above (`UNSET`, `COMPUTING`,
     * `ERROR`).
     */
    value: T;
    /**
     * If `value` is `ERRORED`, the error caught from the last computation attempt which will
     * be re-thrown.
     */
    error: unknown;
    /**
     * The computation function which will produce a new value.
     */
    computation: () => T;
    equal: ValueEqualityFn<T>;
}
type ComputedGetter<T> = (() => T) & {
    [SIGNAL]: ComputedNode<T>;
};
/**
 * Create a computed signal which derives a reactive value from an expression.
 */
declare function createComputed<T>(computation: () => T, equal?: ValueEqualityFn<T>): ComputedGetter<T>;
/**
 * A dedicated symbol used in place of a computed signal value to indicate that a given computation
 * failed. The thrown error is cached until the computation gets dirty again.
 * Explicitly typed as `any` so we can use it as signal's value.
 */
declare const ERRORED: any;

type ComputationFn<S, D> = (source: S, previous?: PreviousValue<S, D>) => D;
type PreviousValue<S, D> = {
    source: S;
    value: D;
};
interface LinkedSignalNode<S, D> extends ReactiveNode {
    /**
     * Value of the source signal that was used to derive the computed value.
     */
    sourceValue: S;
    /**
     * Current state value, or one of the sentinel values (`UNSET`, `COMPUTING`,
     * `ERROR`).
     */
    value: D;
    /**
     * If `value` is `ERRORED`, the error caught from the last computation attempt which will
     * be re-thrown.
     */
    error: unknown;
    /**
     * The source function represents reactive dependency based on which the linked state is reset.
     */
    source: () => S;
    /**
     * The computation function which will produce a new value based on the source and, optionally - previous values.
     */
    computation: ComputationFn<S, D>;
    equal: ValueEqualityFn<D>;
}
type LinkedSignalGetter<S, D> = (() => D) & {
    [SIGNAL]: LinkedSignalNode<S, D>;
};
declare function createLinkedSignal<S, D>(sourceFn: () => S, computationFn: ComputationFn<S, D>, equalityFn?: ValueEqualityFn<D>): LinkedSignalGetter<S, D>;
declare function linkedSignalSetFn<S, D>(node: LinkedSignalNode<S, D>, newValue: D): void;
declare function linkedSignalUpdateFn<S, D>(node: LinkedSignalNode<S, D>, updater: (value: D) => D): void;

declare function setThrowInvalidWriteToSignalError(fn: <T>(node: SignalNode<T>) => never): void;

/**
 * A cleanup function that can be optionally registered from the watch logic. If registered, the
 * cleanup logic runs before the next watch execution.
 */
type WatchCleanupFn = () => void;
/**
 * A callback passed to the watch function that makes it possible to register cleanup logic.
 */
type WatchCleanupRegisterFn = (cleanupFn: WatchCleanupFn) => void;
interface Watch {
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
interface WatchNode extends ReactiveNode {
    fn: ((onCleanup: WatchCleanupRegisterFn) => void) | null;
    schedule: ((watch: Watch) => void) | null;
    cleanupFn: WatchCleanupFn;
    ref: Watch;
}
declare function createWatch(fn: (onCleanup: WatchCleanupRegisterFn) => void, schedule: (watch: Watch) => void, allowSignalWrites: boolean): Watch;

/**
 * Execute an arbitrary function in a non-reactive (non-tracking) context. The executed function
 * can, optionally, return a value.
 */
declare function untracked<T>(nonReactiveReadsFn: () => T): T;

export { ERRORED, ReactiveNode, SIGNAL, SignalNode, ValueEqualityFn, createComputed, createLinkedSignal, createWatch, linkedSignalSetFn, linkedSignalUpdateFn, setThrowInvalidWriteToSignalError, untracked };
export type { ComputationFn, ComputedNode, LinkedSignalGetter, LinkedSignalNode, PreviousValue, Watch, WatchCleanupFn, WatchCleanupRegisterFn };
