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
  ResourceLoader,
  Resource,
  ResourceRef,
  ResourceStreamingLoader,
  PromiseResourceOptions,
  StreamingResourceOptions,
} from './api';
import {ValueEqualityFn} from '@angular/core/primitives/signals';
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
 * @experimental
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
 * @experimental
 */
export function resource<T, R>(options: ResourceOptions<T, R>): ResourceRef<T | undefined>;
export function resource<T, R>(options: ResourceOptions<T, R>): ResourceRef<T | undefined> {
  options?.injector || assertInInjectionContext(resource);
  const request = (options.request ?? (() => null)) as () => R;
  return new ResourceImpl<T | undefined, R>(
    request,
    getLoader(options),
    options.defaultValue,
    options.equal ? wrapEqualityFn(options.equal) : undefined,
    options.injector ?? inject(Injector),
  );
}

/**
 * Internal state of a resource.
 */
interface ResourceState<T> {
  // Error state is defined as Resolved && state.error.
  status: Exclude<ResourceStatus, ResourceStatus.Error>;
  previousStatus: ResourceStatus;
  stream: Signal<{value: T} | {error: unknown}> | undefined;
}

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

  readonly isLoading = computed(
    () => this.status() === ResourceStatus.Loading || this.status() === ResourceStatus.Reloading,
  );

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
class ResourceImpl<T, R> extends BaseWritableResource<T> implements ResourceRef<T> {
  /**
   * The current state of the resource. Status, value, and error are derived from this.
   */
  private readonly state: WritableSignal<ResourceState<T>>;

  /**
   * Signal of both the request value `R` and a writable `reload` signal that's linked/associated
   * to the given request. Changing the value of the `reload` signal causes the resource to reload.
   */
  private readonly extendedRequest: Signal<{request: R; reload: WritableSignal<number>}>;

  private readonly pendingTasks: PendingTasks;
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
          const stream = this.state()?.stream?.();
          return stream && isResolved(stream) ? stream.value : this.defaultValue;
        },
        {equal},
      ),
    );
    this.pendingTasks = injector.get(PendingTasks);

    // Extend `request()` to include a writable reload signal.
    this.extendedRequest = computed(() => ({
      request: request(),
      reload: signal(0),
    }));

    // The main resource state is managed in a `linkedSignal`, which allows the resource to change
    // state instantaneously when the request signal changes.
    this.state = linkedSignal<
      ResourceStatus.Idle | ResourceStatus.Loading | ResourceStatus.Reloading,
      ResourceState<T>
    >({
      // We use the request (as well as its reload signal) to derive the initial status of the
      // resource (Idle, Loading, or Reloading) in response to request changes. From this initial
      // status, the resource's effect will then trigger the loader and update to a Resolved or
      // Error state as appropriate.
      source: () => {
        const {request, reload} = this.extendedRequest();
        if (request === undefined || this.destroyed) {
          return ResourceStatus.Idle;
        }
        return reload() === 0 ? ResourceStatus.Loading : ResourceStatus.Reloading;
      },
      // Compute the state of the resource given a change in status.
      computation: (status, previous) =>
        ({
          status,
          // When the state of the resource changes due to the request, remember the previous status
          // for the loader to consider.
          previousStatus: computeStatusOfState(previous?.value),
          // In `Reloading` state, we keep the previous value if there is one, since the identity of
          // the request hasn't changed. Otherwise, we switch back to the default value.
          stream:
            previous && status === ResourceStatus.Reloading ? previous.value.stream : undefined,
        }) satisfies ResourceState<T>,
    });

    this.effectRef = effect(this.loadEffect.bind(this), {
      injector,
      manualCleanup: true,
    });

    // Cancel any pending request when the resource itself is destroyed.
    injector.get(DestroyRef).onDestroy(() => this.destroy());
  }

  override readonly status = computed(() => {
    if (this.state().status !== ResourceStatus.Resolved) {
      return this.state().status;
    }
    return isResolved(this.state().stream!()) ? ResourceStatus.Resolved : ResourceStatus.Error;
  });

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

    if (
      untracked(this.status) === ResourceStatus.Local &&
      (this.equal ? this.equal(current, value) : current === value)
    ) {
      return;
    }

    // Enter Local state with the user-defined value.
    this.state.set({
      status: ResourceStatus.Local,
      previousStatus: ResourceStatus.Local,
      stream: signal({value}),
    });

    // We're departing from whatever state the resource was in previously, so cancel any in-progress
    // loading operations.
    this.abortInProgressLoad();
  }

  override reload(): boolean {
    // We don't want to restart in-progress loads.
    const status = untracked(this.status);
    if (
      status === ResourceStatus.Idle ||
      status === ResourceStatus.Loading ||
      status === ResourceStatus.Reloading
    ) {
      return false;
    }

    // Increment the reload signal to trigger the `state` linked signal to switch us to `Reload`
    untracked(this.extendedRequest).reload.update((v) => v + 1);
    return true;
  }

  destroy(): void {
    this.destroyed = true;
    this.effectRef.destroy();
    this.abortInProgressLoad();

    // Destroyed resources enter Idle state.
    this.state.set({
      status: ResourceStatus.Idle,
      previousStatus: ResourceStatus.Idle,
      stream: undefined,
    });
  }

  private async loadEffect(): Promise<void> {
    // Capture the previous status before any state transitions. Note that this is `untracked` since
    // we do not want the effect to depend on the state of the resource, only on the request.
    const {status: currentStatus, previousStatus} = untracked(this.state);

    const {request, reload: reloadCounter} = this.extendedRequest();
    // Subscribe side-effectfully to `reloadCounter`, although we don't actually care about its
    // value. This is used to rerun the effect when `reload()` is triggered.
    reloadCounter();

    if (request === undefined) {
      // Nothing to load (and we should already be in a non-loading state).
      return;
    } else if (
      currentStatus !== ResourceStatus.Loading &&
      currentStatus !== ResourceStatus.Reloading
    ) {
      // We might've transitioned into a loading state, but has since been overwritten (likely via
      // `.set`).
      // In this case, the resource has nothing to do.
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
          request: request as Exclude<R, undefined>,
          abortSignal,
          previous: {
            status: previousStatus,
          },
        });
      });

      if (abortSignal.aborted) {
        return;
      }

      this.state.set({
        status: ResourceStatus.Resolved,
        previousStatus: ResourceStatus.Resolved,
        stream,
      });
    } catch (err) {
      if (abortSignal.aborted) {
        return;
      }

      this.state.set({
        status: ResourceStatus.Resolved,
        previousStatus: ResourceStatus.Error,
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

function computeStatusOfState(state: ResourceState<unknown> | undefined): ResourceStatus {
  switch (state?.status) {
    case undefined:
      return ResourceStatus.Idle;
    case ResourceStatus.Resolved:
      return isResolved(untracked(state.stream!)) ? ResourceStatus.Resolved : ResourceStatus.Error;
    default:
      return state!.status;
  }
}

function isResolved<T>(state: {value: T} | {error: unknown}): state is {value: T} {
  return (state as {error: unknown}).error === undefined;
}
