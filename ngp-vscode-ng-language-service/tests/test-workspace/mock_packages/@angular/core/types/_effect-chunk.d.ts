/**
 * @license Angular v22.3.0-next.0+sha-95e8dec
 * (c) 2010-2026 Google LLC. https://angular.dev/
 * License: MIT
 */

import { ReactiveNode, ValueEqualityFn, SIGNAL, ReactiveHookFn } from './_formatter-chunk.js';

interface SignalNode<T> extends ReactiveNode {
    value: T;
    equal: ValueEqualityFn<T>;
}
type SignalBaseGetter<T> = (() => T) & {
    readonly [SIGNAL]: unknown;
};
type SignalSetter<T> = (newValue: T) => void;
type SignalUpdater<T> = (updateFn: (value: T) => T) => void;
interface SignalGetter<T> extends SignalBaseGetter<T> {
    readonly [SIGNAL]: SignalNode<T>;
}
/**
 * Creates a `Signal` getter, setter, and updater function.
 */
declare function createSignal<T>(initialValue: T, equal?: ValueEqualityFn<T>): [SignalGetter<T>, SignalSetter<T>, SignalUpdater<T>];
declare function setPostSignalSetFn(fn: ReactiveHookFn | null): ReactiveHookFn | null;
declare function signalGetFn<T>(node: SignalNode<T>): T;
declare function signalSetFn<T>(node: SignalNode<T>, newValue: T): void;
declare function signalUpdateFn<T>(node: SignalNode<T>, updater: (value: T) => T): void;
declare function runPostSignalSetFn<T>(node: SignalNode<T>): void;
declare const SIGNAL_NODE: SignalNode<unknown>;

interface BaseEffectNode extends ReactiveNode {
    fn: () => void;
    destroy(): void;
    cleanup(): void;
    run(): void;
}
declare const BASE_EFFECT_NODE: Omit<BaseEffectNode, 'fn' | 'destroy' | 'cleanup' | 'run'>;
declare function runEffect(node: BaseEffectNode): void;

export { BASE_EFFECT_NODE, SIGNAL_NODE, createSignal, runEffect, runPostSignalSetFn, setPostSignalSetFn, signalGetFn, signalSetFn, signalUpdateFn };
export type { BaseEffectNode, SignalGetter, SignalNode };
