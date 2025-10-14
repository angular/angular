/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {
  createLinkedSignal,
  linkedSignalSetFn,
  linkedSignalUpdateFn,
  SIGNAL,
} from '../../../primitives/signals';
import {signalAsReadonlyFn} from './signal';
const identityFn = (v) => v;
export function linkedSignal(optionsOrComputation, options) {
  if (typeof optionsOrComputation === 'function') {
    const getter = createLinkedSignal(optionsOrComputation, identityFn, options?.equal);
    return upgradeLinkedSignalGetter(getter, options?.debugName);
  } else {
    const getter = createLinkedSignal(
      optionsOrComputation.source,
      optionsOrComputation.computation,
      optionsOrComputation.equal,
    );
    return upgradeLinkedSignalGetter(getter, optionsOrComputation.debugName);
  }
}
function upgradeLinkedSignalGetter(getter, debugName) {
  if (ngDevMode) {
    getter.toString = () => `[LinkedSignal: ${getter()}]`;
    getter[SIGNAL].debugName = debugName;
  }
  const node = getter[SIGNAL];
  const upgradedGetter = getter;
  upgradedGetter.set = (newValue) => linkedSignalSetFn(node, newValue);
  upgradedGetter.update = (updateFn) => linkedSignalUpdateFn(node, updateFn);
  upgradedGetter.asReadonly = signalAsReadonlyFn.bind(getter);
  return upgradedGetter;
}
//# sourceMappingURL=linked_signal.js.map
