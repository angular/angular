/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {producerAccessed, SIGNAL, signalSetFn} from '../../../primitives/signals';
import {RuntimeError} from '../../errors';
import {signalAsReadonlyFn} from '../../render3/reactivity/signal';
import {INPUT_SIGNAL_NODE, REQUIRED_UNSET_VALUE} from '../input/input_signal_node';
import {OutputEmitterRef} from '../output/output_emitter_ref';
/**
 * Creates a model signal.
 *
 * @param initialValue The initial value.
 *   Can be set to {@link REQUIRED_UNSET_VALUE} for required model signals.
 * @param options Additional options for the model.
 */
export function createModelSignal(initialValue, opts) {
  const node = Object.create(INPUT_SIGNAL_NODE);
  const emitterRef = new OutputEmitterRef();
  node.value = initialValue;
  function getter() {
    producerAccessed(node);
    assertModelSet(node.value);
    return node.value;
  }
  getter[SIGNAL] = node;
  getter.asReadonly = signalAsReadonlyFn.bind(getter);
  // TODO: Should we throw an error when updating a destroyed model?
  getter.set = (newValue) => {
    if (!node.equal(node.value, newValue)) {
      signalSetFn(node, newValue);
      emitterRef.emit(newValue);
    }
  };
  getter.update = (updateFn) => {
    assertModelSet(node.value);
    getter.set(updateFn(node.value));
  };
  getter.subscribe = emitterRef.subscribe.bind(emitterRef);
  getter.destroyRef = emitterRef.destroyRef;
  if (ngDevMode) {
    getter.toString = () => `[Model Signal: ${getter()}]`;
    node.debugName = opts?.debugName;
  }
  return getter;
}
/** Asserts that a model's value is set. */
function assertModelSet(value) {
  if (value === REQUIRED_UNSET_VALUE) {
    throw new RuntimeError(
      952 /* RuntimeErrorCode.REQUIRED_MODEL_NO_VALUE */,
      ngDevMode && 'Model is required but no value is available yet.',
    );
  }
}
//# sourceMappingURL=model_signal.js.map
