/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {untracked} from '../render3/reactivity/untracked';
import {computed} from '../render3/reactivity/computed';
import {signal, signalAsReadonlyFn} from '../render3/reactivity/signal';
import {effect} from '../render3/reactivity/effect';
import {Injector} from '../di/injector';
import {assertInInjectionContext} from '../di/contextual';
import {inject} from '../di/injector_compatibility';
import {PendingTasks} from '../pending_tasks';
import {linkedSignal} from '../render3/reactivity/linked_signal';
import {DestroyRef} from '../linker/destroy_ref';
/**
 * Whether a `Resource.value()` should throw an error when the resource is in the error state.
 *
 * This internal flag is being used to gradually roll out this behavior.
 */
let RESOURCE_VALUE_THROWS_ERRORS_DEFAULT = true;
export function resource(options) {
  if (ngDevMode && !options?.injector) {
    assertInInjectionContext(resource);
  }
  const oldNameForParams = options.request;
  const params = options.params ?? oldNameForParams ?? (() => null);
  return new ResourceImpl(
    params,
    getLoader(options),
    options.defaultValue,
    options.equal ? wrapEqualityFn(options.equal) : undefined,
    options.injector ?? inject(Injector),
    RESOURCE_VALUE_THROWS_ERRORS_DEFAULT,
  );
}
/**
 * Base class which implements `.value` as a `WritableSignal` by delegating `.set` and `.update`.
 */
class BaseWritableResource {
  constructor(value) {
    this.isError = computed(() => this.status() === 'error');
    this.isLoading = computed(() => this.status() === 'loading' || this.status() === 'reloading');
    // Use a computed here to avoid triggering reactive consumers if the value changes while staying
    // either defined or undefined.
    this.isValueDefined = computed(() => {
      // Check if it's in an error state first to prevent the error from bubbling up.
      if (this.isError()) {
        return false;
      }
      return this.value() !== undefined;
    });
    this.value = value;
    this.value.set = this.set.bind(this);
    this.value.update = this.update.bind(this);
    this.value.asReadonly = signalAsReadonlyFn;
  }
  update(updateFn) {
    this.set(updateFn(untracked(this.value)));
  }
  hasValue() {
    return this.isValueDefined();
  }
  asReadonly() {
    return this;
  }
}
/**
 * Implementation for `resource()` which uses a `linkedSignal` to manage the resource's state.
 */
export class ResourceImpl extends BaseWritableResource {
  constructor(
    request,
    loaderFn,
    defaultValue,
    equal,
    injector,
    throwErrorsFromValue = RESOURCE_VALUE_THROWS_ERRORS_DEFAULT,
  ) {
    super(
      // Feed a computed signal for the value to `BaseWritableResource`, which will upgrade it to a
      // `WritableSignal` that delegates to `ResourceImpl.set`.
      computed(
        () => {
          const streamValue = this.state().stream?.();
          if (!streamValue) {
            return defaultValue;
          }
          // Prevents `hasValue()` from throwing an error when a reload happened in the error state
          if (this.state().status === 'loading' && this.error()) {
            return defaultValue;
          }
          if (!isResolved(streamValue)) {
            if (throwErrorsFromValue) {
              throw new ResourceValueError(this.error());
            } else {
              return defaultValue;
            }
          }
          return streamValue.value;
        },
        {equal},
      ),
    );
    this.loaderFn = loaderFn;
    this.equal = equal;
    this.resolvePendingTask = undefined;
    this.destroyed = false;
    this.status = computed(() => projectStatusOfState(this.state()));
    this.error = computed(() => {
      const stream = this.state().stream?.();
      return stream && !isResolved(stream) ? stream.error : undefined;
    });
    // Extend `request()` to include a writable reload signal.
    this.extRequest = linkedSignal({
      source: request,
      computation: (request) => ({request, reload: 0}),
    });
    // The main resource state is managed in a `linkedSignal`, which allows the resource to change
    // state instantaneously when the request signal changes.
    this.state = linkedSignal({
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
    this.unregisterOnDestroy = injector.get(DestroyRef).onDestroy(() => this.destroy());
  }
  /**
   * Called either directly via `WritableResource.set` or via `.value.set()`.
   */
  set(value) {
    if (this.destroyed) {
      return;
    }
    const error = untracked(this.error);
    const state = untracked(this.state);
    if (!error) {
      const current = untracked(this.value);
      if (
        state.status === 'local' &&
        (this.equal ? this.equal(current, value) : current === value)
      ) {
        return;
      }
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
  reload() {
    // We don't want to restart in-progress loads.
    const {status} = untracked(this.state);
    if (status === 'idle' || status === 'loading') {
      return false;
    }
    // Increment the request reload to trigger the `state` linked signal to switch us to `Reload`
    this.extRequest.update(({request, reload}) => ({request, reload: reload + 1}));
    return true;
  }
  destroy() {
    this.destroyed = true;
    this.unregisterOnDestroy();
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
  async loadEffect() {
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
    let resolvePendingTask = (this.resolvePendingTask = this.pendingTasks.add());
    const {signal: abortSignal} = (this.pendingController = new AbortController());
    try {
      // The actual loading is run through `untracked` - only the request side of `resource` is
      // reactive. This avoids any confusion with signals tracking or not tracking depending on
      // which side of the `await` they are.
      const stream = await untracked(() => {
        return this.loaderFn({
          params: extRequest.request,
          // TODO(alxhub): cleanup after g3 removal of `request` alias.
          request: extRequest.request,
          abortSignal,
          previous: {
            status: previousStatus,
          },
        });
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
        stream: signal({error: encapsulateResourceError(err)}),
      });
    } finally {
      // Resolve the pending task now that the resource has a value.
      resolvePendingTask?.();
      resolvePendingTask = undefined;
    }
  }
  abortInProgressLoad() {
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
function wrapEqualityFn(equal) {
  return (a, b) => (a === undefined || b === undefined ? a === b : equal(a, b));
}
function getLoader(options) {
  if (isStreamingResourceOptions(options)) {
    return options.stream;
  }
  return async (params) => {
    try {
      return signal({value: await options.loader(params)});
    } catch (err) {
      return signal({error: encapsulateResourceError(err)});
    }
  };
}
function isStreamingResourceOptions(options) {
  return !!options.stream;
}
/**
 * Project from a state with `ResourceInternalStatus` to the user-facing `ResourceStatus`
 */
function projectStatusOfState(state) {
  switch (state.status) {
    case 'loading':
      return state.extRequest.reload === 0 ? 'loading' : 'reloading';
    case 'resolved':
      return isResolved(state.stream()) ? 'resolved' : 'error';
    default:
      return state.status;
  }
}
function isResolved(state) {
  return state.error === undefined;
}
export function encapsulateResourceError(error) {
  if (error instanceof Error) {
    return error;
  }
  return new ResourceWrappedError(error);
}
class ResourceValueError extends Error {
  constructor(error) {
    super(
      ngDevMode
        ? `Resource is currently in an error state (see Error.cause for details): ${error.message}`
        : error.message,
      {cause: error},
    );
  }
}
class ResourceWrappedError extends Error {
  constructor(error) {
    super(
      ngDevMode
        ? `Resource returned an error that's not an Error instance: ${String(error)}. Check this error's .cause for the actual error.`
        : String(error),
      {cause: error},
    );
  }
}
//# sourceMappingURL=resource.js.map
