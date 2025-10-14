/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {
  assertInInjectionContext,
  assertNotInReactiveContext,
  computed,
  DestroyRef,
  inject,
  signal,
  ɵRuntimeError,
} from '../../src/core';
/**
 * Get the current value of an `Observable` as a reactive `Signal`.
 *
 * `toSignal` returns a `Signal` which provides synchronous reactive access to values produced
 * by the given `Observable`, by subscribing to that `Observable`. The returned `Signal` will always
 * have the most recent value emitted by the subscription, and will throw an error if the
 * `Observable` errors.
 *
 * With `requireSync` set to `true`, `toSignal` will assert that the `Observable` produces a value
 * immediately upon subscription. No `initialValue` is needed in this case, and the returned signal
 * does not include an `undefined` type.
 *
 * By default, the subscription will be automatically cleaned up when the current [injection
 * context](guide/di/dependency-injection-context) is destroyed. For example, when `toSignal` is
 * called during the construction of a component, the subscription will be cleaned up when the
 * component is destroyed. If an injection context is not available, an explicit `Injector` can be
 * passed instead.
 *
 * If the subscription should persist until the `Observable` itself completes, the `manualCleanup`
 * option can be specified instead, which disables the automatic subscription teardown. No injection
 * context is needed in this configuration as well.
 */
export function toSignal(source, options) {
  typeof ngDevMode !== 'undefined' &&
    ngDevMode &&
    assertNotInReactiveContext(
      toSignal,
      'Invoking `toSignal` causes new subscriptions every time. ' +
        'Consider moving `toSignal` outside of the reactive context and read the signal value where needed.',
    );
  const requiresCleanup = !options?.manualCleanup;
  if (ngDevMode && requiresCleanup && !options?.injector) {
    assertInInjectionContext(toSignal);
  }
  const cleanupRef = requiresCleanup
    ? (options?.injector?.get(DestroyRef) ?? inject(DestroyRef))
    : null;
  const equal = makeToSignalEqual(options?.equal);
  // Note: T is the Observable value type, and U is the initial value type. They don't have to be
  // the same - the returned signal gives values of type `T`.
  let state;
  if (options?.requireSync) {
    // Initially the signal is in a `NoValue` state.
    state = signal({kind: 0 /* StateKind.NoValue */}, {equal});
  } else {
    // If an initial value was passed, use it. Otherwise, use `undefined` as the initial value.
    state = signal({kind: 1 /* StateKind.Value */, value: options?.initialValue}, {equal});
  }
  let destroyUnregisterFn;
  // Note: This code cannot run inside a reactive context (see assertion above). If we'd support
  // this, we would subscribe to the observable outside of the current reactive context, avoiding
  // that side-effect signal reads/writes are attribute to the current consumer. The current
  // consumer only needs to be notified when the `state` signal changes through the observable
  // subscription. Additional context (related to async pipe):
  // https://github.com/angular/angular/pull/50522.
  const sub = source.subscribe({
    next: (value) => state.set({kind: 1 /* StateKind.Value */, value}),
    error: (error) => {
      state.set({kind: 2 /* StateKind.Error */, error});
      destroyUnregisterFn?.();
    },
    complete: () => {
      destroyUnregisterFn?.();
    },
    // Completion of the Observable is meaningless to the signal. Signals don't have a concept of
    // "complete".
  });
  if (options?.requireSync && state().kind === 0 /* StateKind.NoValue */) {
    throw new ɵRuntimeError(
      601 /* ɵRuntimeErrorCode.REQUIRE_SYNC_WITHOUT_SYNC_EMIT */,
      (typeof ngDevMode === 'undefined' || ngDevMode) &&
        '`toSignal()` called with `requireSync` but `Observable` did not emit synchronously.',
    );
  }
  // Unsubscribe when the current context is destroyed, if requested.
  destroyUnregisterFn = cleanupRef?.onDestroy(sub.unsubscribe.bind(sub));
  // The actual returned signal is a `computed` of the `State` signal, which maps the various states
  // to either values or errors.
  return computed(
    () => {
      const current = state();
      switch (current.kind) {
        case 1 /* StateKind.Value */:
          return current.value;
        case 2 /* StateKind.Error */:
          throw current.error;
        case 0 /* StateKind.NoValue */:
          // This shouldn't really happen because the error is thrown on creation.
          throw new ɵRuntimeError(
            601 /* ɵRuntimeErrorCode.REQUIRE_SYNC_WITHOUT_SYNC_EMIT */,
            (typeof ngDevMode === 'undefined' || ngDevMode) &&
              '`toSignal()` called with `requireSync` but `Observable` did not emit synchronously.',
          );
      }
    },
    {equal: options?.equal},
  );
}
function makeToSignalEqual(userEquality = Object.is) {
  return (a, b) =>
    a.kind === 1 /* StateKind.Value */ &&
    b.kind === 1 /* StateKind.Value */ &&
    userEquality(a.value, b.value);
}
//# sourceMappingURL=to_signal.js.map
