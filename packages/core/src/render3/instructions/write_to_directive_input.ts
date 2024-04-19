/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {setActiveConsumer, SIGNAL} from '@angular/core/primitives/signals';

import {InputSignalWithTransform} from '../../authoring/input/input_signal';
import {InputSignalNode} from '../../authoring/input/input_signal_node';
import {applyValueToInputField} from '../apply_value_input_field';
import {DirectiveDef} from '../interfaces/definition';
import { InputFlags } from '../interfaces/input_flags';

export function writeToDirectiveInput<T>(
    def: DirectiveDef<T>, instance: T, publicName: string, privateName: string, flags: InputFlags,
    value: unknown) {
  const prevConsumer = setActiveConsumer(null);
  try {
    // If we know we are dealing with a signal input, we cache its reference
    // in a tree-shakable way. The input signal node can then be used for
    // value transform execution or actual value updates without introducing
    // additional megamorphic accesses for accessing the instance field.
    let inputSignalNode: InputSignalNode<unknown, unknown>|null = null;
    if ((flags & InputFlags.SignalBased) !== 0) {
      const field = (instance as any)[privateName] as InputSignalWithTransform<unknown, unknown>;
      inputSignalNode = field[SIGNAL];
    }

    // If there is a signal node and a transform, run it before potentially
    // delegating to features like `NgOnChanges`.
    if (inputSignalNode !== null && inputSignalNode.transformFn !== undefined) {
      value = inputSignalNode.transformFn(value);
    }
    // If there is a decorator input transform, run it.
    if ((flags & InputFlags.HasDecoratorInputTransform) !== 0) {
      value = def.inputTransforms![privateName]!.call(instance, value);
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
