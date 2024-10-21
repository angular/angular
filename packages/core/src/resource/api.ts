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

/**
 * Status of a `Resource`.
 *
 * @experimental
 */
export enum ResourceStatus {
  /**
   * The resource has no valid request and will not perform any loading.
   *
   * `value()` will be `undefined`.
   */
  Idle,

  /**
   * Loading failed with an error.
   *
   * `value()` will be `undefined`.
   */
  Error,

  /**
   * The resource is currently loading a new value as a result of a change in its `request`.
   *
   * `value()` will be `undefined`.
   */
  Loading,

  /**
   * The resource is currently reloading a fresh value for the same request.
   *
   * `value()` will continue to return the previously fetched value during the reloading operation.
   */
  Reloading,

  /**
   * Loading has completed and the resource has the value returned from the loader.
   */
  Resolved,

  /**
   * The resource's value was set locally via `.set()` or `.update()`.
   */
  Local,
}

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
   * The current value of the `Resource`, or `undefined` if there is no current value.
   */
  readonly value: Signal<T | undefined>;

  /**
   * The current status of the `Resource`, which describes what the resource is currently doing and
   * what can be expected of its `value`.
   */
  readonly status: Signal<ResourceStatus>;

  /**
   * When in the `error` state, this returns the last known error from the `Resource`.
   */
  readonly error: Signal<unknown>;

  /**
   * Whether this resource is loading a new value (or reloading the existing one).
   */
  readonly isLoading: Signal<boolean>;

  /**
   * Whether this resource has a valid current value.
   *
   * This function is reactive.
   */
  hasValue(): this is Resource<T> & {value: Signal<T>};

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
 * A `Resource` with a mutable value.
 *
 * Overwriting the value of a resource sets it to the 'local' state.
 *
 * @experimental
 */
export interface WritableResource<T> extends Resource<T> {
  readonly value: WritableSignal<T | undefined>;
  hasValue(): this is WritableResource<T> & {value: WritableSignal<T>};

  /**
   * Convenience wrapper for `value.set`.
   */
  set(value: T | undefined): void;

  /**
   * Convenience wrapper for `value.update`.
   */
  update(updater: (value: T | undefined) => T | undefined): void;
  asReadonly(): Resource<T>;
}

/**
 * A `WritableResource` created through the `resource` function.
 *
 * @experimental
 */
export interface ResourceRef<T> extends WritableResource<T> {
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
  request: Exclude<NoInfer<R>, undefined>;
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
 * Options to the `resource` function, for creating a resource.
 *
 * @experimental
 */
export interface ResourceOptions<T, R> {
  /**
   * A reactive function which determines the request to be made. Whenever the request changes, the
   * loader will be triggered to fetch a new value for the resource.
   *
   * If a request function isn't provided, the loader won't rerun unless the resource is reloaded.
   */
  request?: () => R;

  /**
   * Loading function which returns a `Promise` of the resource's value for a given request.
   */
  loader: ResourceLoader<T, R>;

  /**
   * Equality function used to compare the return value of the loader.
   */
  equal?: ValueEqualityFn<T>;

  /**
   * Overrides the `Injector` used by `resource`.
   */
  injector?: Injector;
}
