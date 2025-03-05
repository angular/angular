/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * @fileoverview
 * This file contains various signal `model()` patterns and ensures
 * the resulting types match our expectations (via comments asserting the `.d.ts`).
 */

import {input, model, signal, ɵunwrapWritableSignal as unwrapWritableSignal} from '../../src/core';
// import preserved to simplify `.d.ts` emit and simplify the `type_tester` logic.
// tslint:disable-next-line no-duplicate-imports
import {InputSignal, WritableSignal} from '../../src/core';

export class SignalModelSignatureTest {
  /** string | undefined */
  optionalModel = unwrapWritableSignal(model<string>());

  /** string */
  requiredModel = unwrapWritableSignal(model.required<string>());

  /** string | number */
  writableSignal = unwrapWritableSignal(signal<string | number>(0));

  /** InputSignal<string | undefined> */
  optionalReadonlySignal = unwrapWritableSignal(input<string>());

  /** InputSignal<string> */
  requiredReadonlySignal = unwrapWritableSignal(input.required<string>());

  /** number */
  primitiveValue = unwrapWritableSignal(123);

  /** (value: string | null | undefined) => number */
  getterFunction = unwrapWritableSignal((value: string | null | undefined) =>
    value ? parseInt(value) : 0,
  );
}
