/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { WritableSignal } from '../render3/reactivity/signal';
import { Signal } from '../render3/reactivity/api';
import { ResourceOptions, ResourceStatus, WritableResource, Resource, ResourceRef, ResourceStreamingLoader } from './api';
import { ValueEqualityFn } from '../../primitives/signals';
import { Injector } from '../di/injector';
/**
 * Constructs a `Resource` that projects a reactive request to an asynchronous operation defined by
 * a loader function, which exposes the result of the loading operation via signals.
 *
 * Note that `resource` is intended for _read_ operations, not operations which perform mutations.
 * `resource` will cancel in-progress loads via the `AbortSignal` when destroyed or when a new
 * request object becomes available, which could prematurely abort mutations.
 *
 * @experimental 19.0
 */
export declare function resource<T, R>(options: ResourceOptions<T, R> & {
    defaultValue: NoInfer<T>;
}): ResourceRef<T>;
/**
 * Constructs a `Resource` that projects a reactive request to an asynchronous operation defined by
 * a loader function, which exposes the result of the loading operation via signals.
 *
 * Note that `resource` is intended for _read_ operations, not operations which perform mutations.
 * `resource` will cancel in-progress loads via the `AbortSignal` when destroyed or when a new
 * request object becomes available, which could prematurely abort mutations.
 *
 * @experimental 19.0
 */
export declare function resource<T, R>(options: ResourceOptions<T, R>): ResourceRef<T | undefined>;
type WrappedRequest = {
    request: unknown;
    reload: number;
};
/**
 * Base class which implements `.value` as a `WritableSignal` by delegating `.set` and `.update`.
 */
declare abstract class BaseWritableResource<T> implements WritableResource<T> {
    readonly value: WritableSignal<T>;
    abstract readonly status: Signal<ResourceStatus>;
    abstract readonly error: Signal<Error | undefined>;
    abstract reload(): boolean;
    constructor(value: Signal<T>);
    abstract set(value: T): void;
    private readonly isError;
    update(updateFn: (value: T) => T): void;
    readonly isLoading: Signal<boolean>;
    private readonly isValueDefined;
    hasValue(): this is ResourceRef<Exclude<T, undefined>>;
    asReadonly(): Resource<T>;
}
/**
 * Implementation for `resource()` which uses a `linkedSignal` to manage the resource's state.
 */
export declare class ResourceImpl<T, R> extends BaseWritableResource<T> implements ResourceRef<T> {
    private readonly loaderFn;
    private readonly equal;
    private readonly pendingTasks;
    /**
     * The current state of the resource. Status, value, and error are derived from this.
     */
    private readonly state;
    /**
     * Combines the current request with a reload counter which allows the resource to be reloaded on
     * imperative command.
     */
    protected readonly extRequest: WritableSignal<WrappedRequest>;
    private readonly effectRef;
    private pendingController;
    private resolvePendingTask;
    private destroyed;
    private unregisterOnDestroy;
    constructor(request: () => R, loaderFn: ResourceStreamingLoader<T, R>, defaultValue: T, equal: ValueEqualityFn<T> | undefined, injector: Injector, throwErrorsFromValue?: boolean);
    readonly status: Signal<ResourceStatus>;
    readonly error: Signal<Error | undefined>;
    /**
     * Called either directly via `WritableResource.set` or via `.value.set()`.
     */
    set(value: T): void;
    reload(): boolean;
    destroy(): void;
    private loadEffect;
    private abortInProgressLoad;
}
export declare function encapsulateResourceError(error: unknown): Error;
export {};
