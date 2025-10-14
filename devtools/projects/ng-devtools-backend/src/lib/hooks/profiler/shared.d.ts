/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { ElementPosition, LifecycleProfile } from '../../../../../protocol';
import { Subject } from 'rxjs';
import { NodeArray } from '../identity-tracker';
type CreationHook = (componentOrDirective: any, node: Node, id: number, isComponent: boolean, position: ElementPosition) => void;
type LifecycleStartHook = (componentOrDirective: any, hook: keyof LifecycleProfile, node: Node, id: number, isComponent: boolean) => void;
type LifecycleEndHook = (componentOrDirective: any, hook: keyof LifecycleProfile, node: Node, id: number, isComponent: boolean) => void;
type ChangeDetectionStartHook = (component: any, node: Node, id: number, position: ElementPosition) => void;
type ChangeDetectionEndHook = (component: any, node: Node, id: number, position: ElementPosition) => void;
type DestroyHook = (componentOrDirective: any, node: Node, id: number, isComponent: boolean, position: ElementPosition) => void;
type OutputStartHook = (componentOrDirective: any, outputName: string, node: Node, isComponent: boolean) => void;
type OutputEndHook = (componentOrDirective: any, outputName: string, node: Node, isComponent: boolean) => void;
export interface Hooks {
    onCreate: CreationHook;
    onDestroy: DestroyHook;
    onChangeDetectionStart: ChangeDetectionStartHook;
    onChangeDetectionEnd: ChangeDetectionEndHook;
    onLifecycleHookStart: LifecycleStartHook;
    onLifecycleHookEnd: LifecycleEndHook;
    onOutputStart: OutputStartHook;
    onOutputEnd: OutputEndHook;
}
/**
 *  Class for profiling angular applications. Handles hook subscriptions and emitting change
 * detection events.
 */
export declare abstract class Profiler {
    /** @internal */
    protected _inChangeDetection: boolean;
    changeDetection$: Subject<void>;
    private _hooks;
    constructor(config?: Partial<Hooks>);
    abstract destroy(): void;
    abstract onIndexForest(newNodes: NodeArray, removedNodes: NodeArray): void;
    subscribe(config: Partial<Hooks>): void;
    unsubscribe(config: Partial<Hooks>): void;
    /** @internal */
    protected _onCreate(_: any, __: Node, id: number | undefined, ___: boolean, position: ElementPosition | undefined): void;
    /** @internal */
    protected _onDestroy(_: any, __: Node, id: number | undefined, ___: boolean, position: ElementPosition | undefined): void;
    /** @internal */
    protected _onChangeDetectionStart(_: any, __: Node, id: number | undefined, position: ElementPosition | undefined): void;
    /** @internal */
    protected _onChangeDetectionEnd(_: any, __: Node, id: number | undefined, position: ElementPosition | undefined): void;
    /** @internal */
    protected _onLifecycleHookStart(_: any, __: keyof LifecycleProfile | 'unknown', ___: Node, id: number | undefined, ____: boolean): void;
    /** @internal */
    protected _onLifecycleHookEnd(_: any, __: keyof LifecycleProfile | 'unknown', ___: Node, id: number | undefined, ____: boolean): void;
    /** @internal */
    protected _onOutputStart(_: any, __: string, ___: Node, id: number | undefined, ____: boolean): void;
    /** @internal */
    protected _onOutputEnd(_: any, __: string, ___: Node, id: number | undefined, ____: boolean): void;
    /** @internal */
    private _invokeCallback;
}
export declare const getLifeCycleName: (obj: {}, fn: any) => keyof LifecycleProfile | "unknown";
export {};
