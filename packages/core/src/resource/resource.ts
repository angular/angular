/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {untracked} from '../render3/reactivity/untracked';
import {computed} from '../render3/reactivity/computed';
import {signal, signalAsReadonlyFn, WritableSignal} from '../render3/reactivity/signal';
import {Signal} from '../render3/reactivity/api';
import {effect, EffectRef} from '../render3/reactivity/effect';
import {
  ResourceOptions,
  ResourceStatus,
  WritableResource,
  Resource,
  ResourceRef,
  ResourceStreamingLoader,
  StreamingResourceOptions,
  ResourceStreamItem,
  ResourceLoaderParams,
} from './api';

import {ValueEqualityFn} from '../../primitives/signals';

import {Injector} from '../di/injector';
import {assertInInjectionContext} from '../di/contextual';
import {inject} from '../di/injector_compatibility';
import {PendingTasks} from '../pending_tasks';
import {linkedSignal} from '../render3/reactivity/linked_signal';
import {DestroyRef} from '../linker/destroy_ref';

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
export function resource<T, R>(
  options: ResourceOptions<T, R> & {defaultValue: NoInfer<T>},
): ResourceRef<T>;

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
export function resource<T, R>(options: ResourceOptions<T, R>): ResourceRef<T | undefined>;
export function resource<T, R>(options: ResourceOptions<T, R>): ResourceRef<T | undefined> {
  options?.injector || assertInInjectionContext(resource);
  const oldNameForParams = (
    options as ResourceOptions<T, R> & {request: ResourceOptions<T, R>['params']}
  ).request;
  const params = (options.params ?? oldNameForParams ?? (() => null)) as () => R;
  return new ResourceImpl<T | undefined, R>(
    params,
    getLoader(options),
    options.defaultValue,
    options.equal ? wrapEqualityFn(options.equal) : undefined,
    options.injector ?? inject(Injector),
  );
}

type ResourceInternalStatus = 'idle' | 'loading' | 'resolved' | 'local';

/**
 * Internal state of a resource.
 */
interface ResourceProtoState<T> {
  extRequest: WrappedRequest;

  // For simplicity, status is internally tracked as a subset of the public status enum.
  // Reloading and Error statuses are projected from Loading and Resolved based on other state.
  status: ResourceInternalStatus;
}

interface ResourceState<T> extends ResourceProtoState<T> {
  previousStatus: ResourceStatus;
  stream: Signal<ResourceStreamItem<T>> | undefined;
}

type WrappedRequest = {request: unknown; reload: number};

/**
 * Base class which implements `.value` as a `WritableSignal` by delegating `.set` and `.update`.
 */
abstract class BaseWritableResource<T> implements WritableResource<T> {
  readonly value: WritableSignal<T>;
  abstract readonly status: Signal<ResourceStatus>;
  abstract readonly error: Signal<unknown>;
  abstract reload(): boolean;

  constructor(value: Signal<T>) {
    this.value = value as WritableSignal<T>;
    this.value.set = this.set.bind(this);
    this.value.update = this.update.bind(this);
    this.value.asReadonly = signalAsReadonlyFn;
  }

  abstract set(value: T): void;

  update(updateFn: (value: T) => T): void {
    this.set(updateFn(untracked(this.value)));
  }

  readonly isLoading = computed(() => this.status() === 'loading' || this.status() === 'reloading');

  hasValue(): this is ResourceRef<Exclude<T, undefined>> {
    return this.value() !== undefined;
  }

  asReadonly(): Resource<T> {
    return this;
  }
}

/**
 * Implementation for `resource()` which uses a `linkedSignal` to manage the resource's state.
 */
export class ResourceImpl<T, R> extends BaseWritableResource<T> implements ResourceRef<T> {
  private readonly pendingTasks: PendingTasks;

  /**
   * The current state of the resource. Status, value, and error are derived from this.
   */
  private readonly state: WritableSignal<ResourceState<T>>;

  /**
   * Combines the current request with a reload counter which allows the resource to be reloaded on
   * imperative command.
   */
  protected readonly extRequest: WritableSignal<WrappedRequest>;
  private readonly effectRef: EffectRef;

  private pendingController: AbortController | undefined;
  private resolvePendingTask: (() => void) | undefined = undefined;
  private destroyed = false;

  constructor(
    request: () => R,
    private readonly loaderFn: ResourceStreamingLoader<T, R>,
    private readonly defaultValue: T,
    private readonly equal: ValueEqualityFn<T> | undefined,
    injector: Injector,
  ) {
    super(
      // Feed a computed signal for the value to `BaseWritableResource`, which will upgrade it to a
      // `WritableSignal` that delegates to `ResourceImpl.set`.
      computed(
        () => {
          const streamValue = this.state().stream?.();
          return streamValue && isResolved(streamValue) ? streamValue.value : this.defaultValue;
        },
        {equal},
      ),
    );

    // Extend `request()` to include a writable reload signal.
    this.extRequest = linkedSignal({
      source: request,
      computation: (request) => ({request, reload: 0}),
    });

    // The main resource state is managed in a `linkedSignal`, which allows the resource to change
    // state instantaneously when the request signal changes.
    this.state = linkedSignal<WrappedRequest, ResourceState<T>>({
      // Whenever the request changes,
      source: this.extRequest,
      // Compute the state of the resource given a change in status.
      computation: (extRequest, previous) => {
        const status = extRequest.request === undefined ? 'idle' : 'loading';
        if (!previous) {
          return {
            extRequest,
            status,
            previousStatus: 'idle',
            stream: undefined,
          };
        } else {
          return {
            extRequest,
            status,
            previousStatus: projectStatusOfState(previous.value),
            // If the request hasn't changed, keep the previous stream.
            stream:
              previous.value.extRequest.request === extRequest.request
                ? previous.value.stream
                : undefined,
          };
        }
      },
    });

    this.effectRef = effect(this.loadEffect.bind(this), {
      injector,
      manualCleanup: true,
    });

    this.pendingTasks = injector.get(PendingTasks);

    // Cancel any pending request when the resource itself is destroyed.
    injector.get(DestroyRef).onDestroy(() => this.destroy());
  }

  override readonly status = computed(() => projectStatusOfState(this.state()));

  override readonly error = computed(() => {
    const stream = this.state().stream?.();
    return stream && !isResolved(stream) ? stream.error : undefined;
  });

  /**
   * Called either directly via `WritableResource.set` or via `.value.set()`.
   */
  override set(value: T): void {
    if (this.destroyed) {
      return;
    }

    const current = untracked(this.value);
    const state = untracked(this.state);

    if (state.status === 'local' && (this.equal ? this.equal(current, value) : current === value)) {
      return;
    }

    // Enter Local state with the user-defined value.
    this.state.set({
      extRequest: state.extRequest,
      status: 'local',
      previousStatus: 'local',
      stream: signal({value}),
    });

    // We're departing from whatever state the resource was in previously, so cancel any in-progress
    // loading operations.
    this.abortInProgressLoad();
  }

  override reload(): boolean {
    // We don't want to restart in-progress loads.
    const {status} = untracked(this.state);
    if (status === 'idle' || status === 'loading') {
      return false;
    }

    // Increment the request reload to trigger the `state` linked signal to switch us to `Reload`
    this.extRequest.update(({request, reload}) => ({request, reload: reload + 1}));
    return true;
  }

  destroy(): void {
    this.destroyed = true;
    this.effectRef.destroy();
    this.abortInProgressLoad();

    // Destroyed resources enter Idle state.
    this.state.set({
      extRequest: {request: undefined, reload: 0},
      status: 'idle',
      previousStatus: 'idle',
      stream: undefined,
    });
  }

  private async loadEffect(): Promise<void> {
    const extRequest = this.extRequest();

    // Capture the previous status before any state transitions. Note that this is `untracked` since
    // we do not want the effect to depend on the state of the resource, only on the request.
    const {status: currentStatus, previousStatus} = untracked(this.state);

    if (extRequest.request === undefined) {
      // Nothing to load (and we should already be in a non-loading state).
      return;
    } else if (currentStatus !== 'loading') {
      // We're not in a loading or reloading state, so this loading request is stale.
      return;
    }

    // Cancel any previous loading attempts.
    this.abortInProgressLoad();

    // Capturing _this_ load's pending task in a local variable is important here. We may attempt to
    // resolve it twice:
    //
    //  1. when the loading function promise resolves/rejects
    //  2. when cancelling the loading operation
    //
    // After the loading operation is cancelled, `this.resolvePendingTask` no longer represents this
    // particular task, but this `await` may eventually resolve/reject. Thus, when we cancel in
    // response to (1) below, we need to cancel the locally saved task.
    let resolvePendingTask: (() => void) | undefined = (this.resolvePendingTask =
      this.pendingTasks.add());

    const {signal: abortSignal} = (this.pendingController = new AbortController());

    try {
      // The actual loading is run through `untracked` - only the request side of `resource` is
      // reactive. This avoids any confusion with signals tracking or not tracking depending on
      // which side of the `await` they are.
      const stream = await untracked(() => {
        return this.loaderFn({
          params: extRequest.request as Exclude<R, undefined>,
          // TODO(alxhub): cleanup after g3 removal of `request` alias.
          request: extRequest.request as Exclude<R, undefined>,
          abortSignal,
          previous: {
            status: previousStatus,
          },
        } as ResourceLoaderParams<R>);
      });

      // If this request has been aborted, or the current request no longer
      // matches this load, then we should ignore this resolution.
      if (abortSignal.aborted || untracked(this.extRequest) !== extRequest) {
        return;
      }

      this.state.set({
        extRequest,
        status: 'resolved',
        previousStatus: 'resolved',
        stream,
      });
    } catch (err) {
      if (abortSignal.aborted || untracked(this.extRequest) !== extRequest) {
        return;
      }

      this.state.set({
        extRequest,
        status: 'resolved',
        previousStatus: 'error',
        stream: signal({error: err}),
      });
    } finally {
      // Resolve the pending task now that the resource has a value.
      resolvePendingTask?.();
      resolvePendingTask = undefined;
    }
  }

  private abortInProgressLoad(): void {
    untracked(() => this.pendingController?.abort());
    this.pendingController = undefined;

    // Once the load is aborted, we no longer want to block stability on its resolution.
    this.resolvePendingTask?.();
    this.resolvePendingTask = undefined;
  }
}

/**
 * Wraps an equality function to handle either value being `undefined`.
 */
function wrapEqualityFn<T>(equal: ValueEqualityFn<T>): ValueEqualityFn<T | undefined> {
  return (a, b) => (a === undefined || b === undefined ? a === b : equal(a, b));
}

function getLoader<T, R>(options: ResourceOptions<T, R>): ResourceStreamingLoader<T, R> {
  if (isStreamingResourceOptions(options)) {
    return options.stream;
  }

  return async (params) => {
    try {
      return signal({value: await options.loader(params)});
    } catch (err) {
      return signal({error: err});
    }
  };
}

function isStreamingResourceOptions<T, R>(
  options: ResourceOptions<T, R>,
): options is StreamingResourceOptions<T, R> {
  return !!(options as StreamingResourceOptions<T, R>).stream;
}

/**
 * Project from a state with `ResourceInternalStatus` to the user-facing `ResourceStatus`
 */
function projectStatusOfState(state: ResourceState<unknown>): ResourceStatus {
  switch (state.status) {
    case 'loading':
      return state.extRequest.reload === 0 ? 'loading' : 'reloading';
    case 'resolved':
      return isResolved(untracked(state.stream!)) ? 'resolved' : 'error';
    default:
      return state.status;
  }
}

function isResolved<T>(state: ResourceStreamItem<T>): state is {value: T} {
  return (state as {error: unknown}).error === undefined;
}
