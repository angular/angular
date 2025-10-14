/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { ValueEqualityFn } from './equality';
import { ReactiveNode, ReactiveHookFn, SIGNAL } from './graph';
export interface SignalNode<T> extends ReactiveNode {
    value: T;
    equal: ValueEqualityFn<T>;
}
export type SignalBaseGetter<T> = (() => T) & {
    readonly [SIGNAL]: unknown;
};
export type SignalSetter<T> = (newValue: T) => void;
export type SignalUpdater<T> = (updateFn: (value: T) => T) => void;
export interface SignalGetter<T> extends SignalBaseGetter<T> {
    readonly [SIGNAL]: SignalNode<T>;
}
/**
 * Creates a `Signal` getter, setter, and updater function.
 */
export declare function createSignal<T>(initialValue: T, equal?: ValueEqualityFn<T>): [SignalGetter<T>, SignalSetter<T>, SignalUpdater<T>];
export declare function setPostSignalSetFn(fn: ReactiveHookFn | null): ReactiveHookFn | null;
export declare function signalGetFn<T>(node: SignalNode<T>): T;
export declare function signalSetFn<T>(node: SignalNode<T>, newValue: T): void;
export declare function signalUpdateFn<T>(node: SignalNode<T>, updater: (value: T) => T): void;
export declare function runPostSignalSetFn<T>(node: SignalNode<T>): void;
export declare const SIGNAL_NODE: SignalNode<unknown>;
