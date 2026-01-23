/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {InputSignalNode} from '../authoring/input/input_signal_node';

export function applyValueToInputField<T>(
  instance: T,
  inputSignalNode: null | InputSignalNode<unknown, unknown>,
  privateName: string,
  value: unknown,
) {
  if (inputSignalNode !== null) {
    inputSignalNode.applyValueToInputSignal(inputSignalNode, value);
  } else {
    (instance as any)[privateName] = value;
  }
}
