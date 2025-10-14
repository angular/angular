/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {setActiveConsumer, SIGNAL} from '../../../primitives/signals';
import {applyValueToInputField} from '../apply_value_input_field';
import {InputFlags} from '../interfaces/input_flags';
import {NodeInjectorFactory} from '../interfaces/injector';
export function writeToDirectiveInput(def, instance, publicName, value) {
  const prevConsumer = setActiveConsumer(null);
  try {
    if (ngDevMode) {
      if (!def.inputs.hasOwnProperty(publicName)) {
        throw new Error(
          `ASSERTION ERROR: Directive ${def.type.name} does not have an input with a public name of "${publicName}"`,
        );
      }
      // Usually we resolve the directive instance using `LView[someIndex]` before writing to an
      // input, however if the read happens to early, the `LView[someIndex]` might actually be a
      // `NodeInjectorFactory`. Check for this specific case here since it can break in subtle ways.
      if (instance instanceof NodeInjectorFactory) {
        throw new Error(
          `ASSERTION ERROR: Cannot write input to factory for type ${def.type.name}. Directive has not been created yet.`,
        );
      }
    }
    const [privateName, flags, transform] = def.inputs[publicName];
    // If we know we are dealing with a signal input, we cache its reference
    // in a tree-shakable way. The input signal node can then be used for
    // value transform execution or actual value updates without introducing
    // additional megamorphic accesses for accessing the instance field.
    let inputSignalNode = null;
    if ((flags & InputFlags.SignalBased) !== 0) {
      const field = instance[privateName];
      inputSignalNode = field[SIGNAL];
    }
    // If there is a signal node and a transform, run it before potentially
    // delegating to features like `NgOnChanges`.
    if (inputSignalNode !== null && inputSignalNode.transformFn !== undefined) {
      value = inputSignalNode.transformFn(value);
    } else if (transform !== null) {
      // If there is a decorator input transform, run it.
      value = transform.call(instance, value);
    }
    if (def.setInput !== null) {
      def.setInput(instance, inputSignalNode, value, publicName, privateName);
    } else {
      applyValueToInputField(instance, inputSignalNode, privateName, value);
    }
  } finally {
    setActiveConsumer(prevConsumer);
  }
}
//# sourceMappingURL=write_to_directive_input.js.map
