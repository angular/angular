/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {SIGNAL} from '@angular/core/primitives/signals';

import {InputSignal} from '../authoring';

import {InputFlags} from './interfaces/definition';

export function applyValueToInputField<T>(
    instance: T, privateName: string, flags: InputFlags, value: unknown) {
  if ((flags & InputFlags.SignalBased) !== 0) {
    const field = (instance as any)[privateName] as InputSignal<unknown, unknown>;
    const node = field[SIGNAL];

    node.applyValueToInputSignal(node, value);
  } else {
    (instance as any)[privateName] = value;
  }
}
