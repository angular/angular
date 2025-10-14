/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {createSignal, SIGNAL} from '../../../primitives/signals';
import {isSignal} from './api';
/** Symbol used distinguish `WritableSignal` from other non-writable signals and functions. */
export const ɵWRITABLE_SIGNAL = /* @__PURE__ */ Symbol('WRITABLE_SIGNAL');
/**
 * Utility function used during template type checking to extract the value from a `WritableSignal`.
 * @codeGenApi
 */
export function ɵunwrapWritableSignal(value) {
  // Note: the function uses `WRITABLE_SIGNAL` as a brand instead of `WritableSignal<T>`,
  // because the latter incorrectly unwraps non-signal getter functions.
  return null;
}
/**
 * Create a `Signal` that can be set or updated directly.
 */
export function signal(initialValue, options) {
  const [get, set, update] = createSignal(initialValue, options?.equal);
  const signalFn = get;
  const node = signalFn[SIGNAL];
  signalFn.set = set;
  signalFn.update = update;
  signalFn.asReadonly = signalAsReadonlyFn.bind(signalFn);
  if (ngDevMode) {
    signalFn.toString = () => `[Signal: ${signalFn()}]`;
    node.debugName = options?.debugName;
  }
  return signalFn;
}
export function signalAsReadonlyFn() {
  const node = this[SIGNAL];
  if (node.readonlyFn === undefined) {
    const readonlyFn = () => this();
    readonlyFn[SIGNAL] = node;
    node.readonlyFn = readonlyFn;
  }
  return node.readonlyFn;
}
/**
 * Checks if the given `value` is a writeable signal.
 */
export function isWritableSignal(value) {
  return isSignal(value) && typeof value.set === 'function';
}
//# sourceMappingURL=signal.js.map
