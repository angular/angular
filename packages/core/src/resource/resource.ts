/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {untracked} from '../render3/reactivity/untracked';
import {computed} from '../render3/reactivity/computed';
import {signal, WritableSignal} from '../render3/reactivity/signal';
import {Signal} from '../render3/reactivity/api';
import {effect, EffectRef} from '../render3/reactivity/effect';
import {
  ResourceOptions,
  ResourceStatus,
  WritableResource,
  ResourceLoader,
  Resource,
  ResourceRef,
} from './api';
import {ValueEqualityFn} from '@angular/core/primitives/signals';
import {Injector} from '../di/injector';
import {assertInInjectionContext} from '../di/contextual';
import {inject} from '../di/injector_compatibility';
import {PendingTasks} from '../pending_tasks';
import {DestroyRef} from '../linker';

import {linkedSignal} from '../render3/reactivity/linked_signal';

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
export function resource<T, R>(options: ResourceOptions<T, R>): ResourceRef<T> {
  options?.injector || assertInInjectionContext(resource);
  const request = (options.request ?? (() => null)) as () => R;
  return new WritableResourceImpl<T, R>(request, options.loader, options.equal, options.injector);
}

interface ResourceState<T> {
  status: ResourceStatus;
  previousStatus: ResourceStatus;
  value: T | undefined;
  error: unknown;
}

/**
 * Base class for `WritableResource` which handles the state operations and is unopinionated on the
 * actual async operation.
 *
 * Mainly factored out for better readability.
 */
abstract class BaseWritableResource<T> implements WritableResource<T> {
  private readonly equal: ValueEqualityFn<T | undefined> | undefined;

  protected readonly state = linkedSignal<ResourceStatus, ResourceState<T>>({
    source: () => this.computeStatus(),
    computation: (status, previous) => ({
      status,
      // When the state of the resource changes due to the request, remember the previous status for
      // the loader to consider.
      previousStatus: previous?.value.status ?? ResourceStatus.Idle,
      value: undefined,
      error: undefined,
    }),
  });

  readonly value: WritableSignal<T | undefined>;
  readonly status = computed(() => this.state().status);
  readonly error = computed(() => this.state().error);

  constructor(equal: ValueEqualityFn<T> | undefined) {
    this.equal = equal && wrapEqualityFn(equal);
    this.value = computed<T | undefined>(() => this.state().value, {
      equal: this.equal,
    }) as WritableSignal<T | undefined>;
    this.value.set = (value: T | undefined) => this.set(value);
    this.value.update = (fn: (value: T | undefined) => T | undefined) =>
      this.set(fn(untracked(this.value)));
  }

  set(value: T | undefined): void {
    const currentState = untracked(this.state);
    if (this.equal ? this.equal(currentState.value, value) : currentState.value === value) {
      return;
    }

    this.state.set({
      status: ResourceStatus.Local,
      previousStatus: ResourceStatus.Local,
      value,
      error: undefined,
    });

    // We're departing from whatever state the resource was in previously, and entering Local state.
    this.onLocalValue();
  }

  update(updater: (value: T | undefined) => T | undefined): void {
    this.value.update(updater);
  }

  readonly isLoading = computed(
    () => this.status() === ResourceStatus.Loading || this.status() === ResourceStatus.Reloading,
  );

  hasValue(): this is WritableResource<T> & {value: WritableSignal<T>} {
    return (
      this.status() === ResourceStatus.Resolved ||
      this.status() === ResourceStatus.Local ||
      this.status() === ResourceStatus.Reloading
    );
  }

  asReadonly(): Resource<T> {
    return this;
  }

  protected abstract computeStatus(): ResourceStatus;

  /**
   * Put the resource in a state with a given value.
   */
  protected setValueState(status: ResourceStatus, value: T | undefined = undefined): void {
    this.state.set({
      status,
      previousStatus: status,
      value,
      error: undefined,
    });
  }

  /**
   * Put the resource into the error state.
   */
  protected setErrorState(error: unknown): void {
    this.state.set({
      status: ResourceStatus.Error,
      previousStatus: ResourceStatus.Error,
      value: undefined,
      error,
    });
  }

  /**
   * Called when the resource is transitioning to local state.
   *
   * For example, this can be used to cancel any in-progress loading operations.
   */
  protected abstract onLocalValue(): void;

  public abstract reload(): boolean;
}

class WritableResourceImpl<T, R> extends BaseWritableResource<T> implements ResourceRef<T> {
  private readonly request: Signal<{request: R; reload: WritableSignal<number>}>;
  private readonly pendingTasks: PendingTasks;
  private readonly effectRef: EffectRef;

  private pendingController: AbortController | undefined;
  private resolvePendingTask: (() => void) | undefined = undefined;

  constructor(
    requestFn: () => R,
    private readonly loaderFn: ResourceLoader<T, R>,
    equal: ValueEqualityFn<T> | undefined,
    injector: Injector | undefined,
  ) {
    super(equal);
    injector = injector ?? inject(Injector);
    this.pendingTasks = injector.get(PendingTasks);

    this.request = computed(() => ({
      // The current request as defined for this resource.
      request: requestFn(),

      // A counter signal which increments from 0, re-initialized for each request (similar to the
      // `linkedSignal` pattern). A value other than 0 indicates a refresh operation.
      reload: signal(0),
    }));

    // The actual data-fetching effect.
    this.effectRef = effect(this.loadEffect.bind(this), {injector, manualCleanup: true});

    // Cancel any pending request when the resource itself is destroyed.
    injector.get(DestroyRef).onDestroy(() => this.destroy());
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

    untracked(this.request).reload.update((v) => v + 1);
    return true;
  }

  destroy(): void {
    this.effectRef.destroy();

    this.abortInProgressLoad();
    this.setValueState(ResourceStatus.Idle);
  }

  protected override computeStatus(): ResourceStatus {
    if (this.request().request === undefined) {
      return ResourceStatus.Idle;
    }
    return this.request().reload() === 0 ? ResourceStatus.Loading : ResourceStatus.Reloading;
  }

  private async loadEffect(): Promise<void> {
    // Capture the status before any state transitions.
    const {status: previousStatus} = untracked(this.state);

    const {request, reload: reloadCounter} = this.request();
    // Subscribe side-effectfully to `reloadCounter`, although we don't actually care about its
    // value. This is used to rerun the effect when `reload()` is triggered.
    reloadCounter();

    if (request === undefined) {
      // Nothing to load (and we should already be in a non-loading state).
      return;
    } else if (
      previousStatus !== ResourceStatus.Loading &&
      previousStatus !== ResourceStatus.Reloading
    ) {
      // We might've transitioned into a loading state, but has since been overwritten (likely via `.set`).
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
    const resolvePendingTask = (this.resolvePendingTask = this.pendingTasks.add());

    const {signal: abortSignal} = (this.pendingController = new AbortController());
    try {
      // The actual loading is run through `untracked` - only the request side of `resource` is
      // reactive. This avoids any confusion with signals tracking or not tracking depending on
      // which side of the `await` they are.
      const result = await untracked(() =>
        this.loaderFn({
          abortSignal,
          request: request as Exclude<R, undefined>,
          previous: {
            status: previousStatus,
          },
        }),
      );
      if (abortSignal.aborted) {
        // This load operation was cancelled.
        return;
      }
      // Success :)
      this.setValueState(ResourceStatus.Resolved, result);
    } catch (err) {
      if (abortSignal.aborted) {
        // This load operation was cancelled.
        return;
      }
      // Fail :(
      this.setErrorState(err);
    } finally {
      // Resolve the pending task now that loading is done.
      resolvePendingTask();

      // Free the abort controller to drop any registered 'abort' callbacks.
      this.pendingController = undefined;
    }
  }

  private abortInProgressLoad(): void {
    this.pendingController?.abort();
    this.pendingController = undefined;

    // Once the load is aborted, we no longer want to block stability on its resolution.
    this.resolvePendingTask?.();
    this.resolvePendingTask = undefined;
  }

  protected override onLocalValue(): void {
    this.abortInProgressLoad();
  }
}

/**
 * Wraps an equality function to handle either value being `undefined`.
 */
function wrapEqualityFn<T>(equal: ValueEqualityFn<T>): ValueEqualityFn<T | undefined> {
  return (a, b) => (a === undefined || b === undefined ? a === b : equal(a, b));
}
