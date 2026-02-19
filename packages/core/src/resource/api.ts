/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Injector} from '../di/injector';
import {Signal, ValueEqualityFn} from '../render3/reactivity/api';
import {WritableSignal} from '../render3/reactivity/signal';

/** Error thrown when a `Resource` dependency of another resource errors. */
export class ResourceDependencyError extends Error {
  /** The dependency that errored. */
  readonly dependency: Resource<unknown>;

  constructor(dependency: Resource<unknown>) {
    super('Dependency error', {cause: dependency.error()});
    this.name = 'ResourceDependencyError';
    this.dependency = dependency;
  }
}

/**
 * Special status codes that can be thrown from a resource's `params` or `request` function to
 * indicate that the resource should transition to that status.
 */
export class ResourceParamsStatus {
  private readonly _brand: undefined;
  private constructor() {}

  /** Status code that transitions the resource to `idle` status. */
  static readonly IDLE = new ResourceParamsStatus();

  /** Status code that transitions the resource to `loading` status. */
  static readonly LOADING = new ResourceParamsStatus();
}

/** Context received by a resource's `params` or `request` function. */
export interface ResourceParamsContext {
  /**
   * Chains the current params off of the value of another resource, returning the value
   * of the other resource if it is available, or propagating the status to the current resource by
   * throwing the appropriate status code if the value is not available.
   */
  chain: <T>(resource: Resource<T>) => T;
}

/**
 * String value capturing the status of a `Resource`.
 *
 * Possible statuses are:
 *
 * `idle` - The resource has no valid request and will not perform any loading. `value()` will be
 * `undefined`.
 *
 * `loading` - The resource is currently loading a new value as a result of a change in its reactive
 * dependencies. `value()` will be `undefined`.
 *
 * `reloading` - The resource is currently reloading a fresh value for the same reactive
 * dependencies. `value()` will continue to return the previously fetched value during the reloading
 * operation.
 *
 * `error` - Loading failed with an error. `value()` will be `undefined`.
 *
 * `resolved` - Loading has completed and the resource has the value returned from the loader.
 *
 * `local` - The resource's value was set locally via `.set()` or `.update()`.
 *
 * @experimental
 */
export type ResourceStatus = 'idle' | 'error' | 'loading' | 'reloading' | 'resolved' | 'local';

/**
 * A Resource is an asynchronous dependency (for example, the results of an API call) that is
 * managed and delivered through signals.
 *
 * The usual way of creating a `Resource` is through the `resource` function, but various other APIs
 * may present `Resource` instances to describe their own concepts.
 *
 * @experimental
 */
export interface Resource<T> {
  /**
   * The current value of the `Resource`, or throws an error if the resource is in an error state.
   */
  readonly value: Signal<T>;

  /**
   * The current status of the `Resource`, which describes what the resource is currently doing and
   * what can be expected of its `value`.
   */
  readonly status: Signal<ResourceStatus>;

  /**
   * When in the `error` state, this returns the last known error from the `Resource`.
   */
  readonly error: Signal<Error | undefined>;

  /**
   * Whether this resource is loading a new value (or reloading the existing one).
   */
  readonly isLoading: Signal<boolean>;

  /**
   * The current state of this resource, represented as a `ResourceSnapshot`.
   */
  readonly snapshot: Signal<ResourceSnapshot<T>>;

  /**
   * Whether this resource has a valid current value.
   *
   * This function is reactive.
   */
  hasValue(this: T extends undefined ? this : never): this is Resource<Exclude<T, undefined>>;

  hasValue(): boolean;
}

/**
 * A `Resource` with a mutable value.
 *
 * Overwriting the value of a resource sets it to the 'local' state.
 *
 * @experimental
 */
export interface WritableResource<T> extends Resource<T> {
  readonly value: WritableSignal<T>;
  hasValue(
    this: T extends undefined ? this : never,
  ): this is WritableResource<Exclude<T, undefined>>;

  hasValue(): boolean;

  /**
   * Convenience wrapper for `value.set`.
   */
  set(value: T): void;

  /**
   * Convenience wrapper for `value.update`.
   */
  update(updater: (value: T) => T): void;
  asReadonly(): Resource<T>;

  /**
   * Instructs the resource to re-load any asynchronous dependency it may have.
   *
   * Note that the resource will not enter its reloading state until the actual backend request is
   * made.
   *
   * @returns true if a reload was initiated, false if a reload was unnecessary or unsupported
   */
  reload(): boolean;
}

/**
 * A `WritableResource` created through the `resource` function.
 *
 * @experimental
 */
export interface ResourceRef<T> extends WritableResource<T> {
  hasValue(this: T extends undefined ? this : never): this is ResourceRef<Exclude<T, undefined>>;

  hasValue(): boolean;
  /**
   * Manually destroy the resource, which cancels pending requests and returns it to `idle` state.
   */
  destroy(): void;
}

/**
 * Parameter to a `ResourceLoader` which gives the request and other options for the current loading
 * operation.
 *
 * @experimental
 */
export interface ResourceLoaderParams<R> {
  params: NoInfer<Exclude<R, undefined>>;
  abortSignal: AbortSignal;
  previous: {
    status: ResourceStatus;
  };
}

/**
 * Loading function for a `Resource`.
 *
 * @experimental
 */
export type ResourceLoader<T, R> = (param: ResourceLoaderParams<R>) => PromiseLike<T>;

/**
 * Streaming loader for a `Resource`.
 *
 * @experimental
 */
export type ResourceStreamingLoader<T, R> = (
  param: ResourceLoaderParams<R>,
) => PromiseLike<Signal<ResourceStreamItem<T>>>;

/**
 * Options to the `resource` function, for creating a resource.
 *
 * @experimental
 */
export interface BaseResourceOptions<T, R> {
  /**
   * A reactive function which determines the request to be made. Whenever the request changes, the
   * loader will be triggered to fetch a new value for the resource.
   *
   * If a params function isn't provided, the loader won't rerun unless the resource is reloaded.
   */
  params?: (ctx: ResourceParamsContext) => R;

  /**
   * The value which will be returned from the resource when a server value is unavailable, such as
   * when the resource is still loading.
   */
  defaultValue?: NoInfer<T>;

  /**
   * Equality function used to compare the return value of the loader.
   */
  equal?: ValueEqualityFn<T>;

  /**
   * Overrides the `Injector` used by `resource`.
   */
  injector?: Injector;
}

/**
 * Options to the `resource` function, for creating a resource.
 *
 * @experimental
 */
export interface PromiseResourceOptions<T, R> extends BaseResourceOptions<T, R> {
  /**
   * Loading function which returns a `Promise` of the resource's value for a given request.
   */
  loader: ResourceLoader<T, R>;

  /**
   * Cannot specify `stream` and `loader` at the same time.
   */
  stream?: never;
}

/**
 * Options to the `resource` function, for creating a resource.
 *
 * @experimental
 */
export interface StreamingResourceOptions<T, R> extends BaseResourceOptions<T, R> {
  /**
   * Loading function which returns a `Promise` of a signal of the resource's value for a given
   * request, which can change over time as new values are received from a stream.
   */
  stream: ResourceStreamingLoader<T, R>;

  /**
   * Cannot specify `stream` and `loader` at the same time.
   */
  loader?: never;
}

/**
 * @experimental
 */
export type ResourceOptions<T, R> = (
  | PromiseResourceOptions<T, R>
  | StreamingResourceOptions<T, R>
) & {
  /**
   * A debug name for the reactive node. Used in Angular DevTools to identify the node.
   */
  debugName?: string;
};

/**
 * @experimental
 */
export type ResourceStreamItem<T> = {value: T} | {error: Error};

/**
 * An explicit representation of a resource's state.
 *
 * @experimental
 * @see [Resource composition with snapshots](guide/signals/resource#resource-composition-with-snapshots)
 */
export type ResourceSnapshot<T> =
  | {readonly status: 'idle'; readonly value: T}
  | {readonly status: 'loading' | 'reloading'; readonly value: T}
  | {readonly status: 'resolved' | 'local'; readonly value: T}
  | {readonly status: 'error'; readonly error: Error};
