/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Directive, input, signal, Input, model, SimpleChanges} from '@angular/core';

// import preserved to simplify `.d.ts` emit and simplify the `type_tester` logic.
// tslint:disable-next-line no-duplicate-imports
import {WritableSignal} from '@angular/core';

export class SimpleChangesSignatureTest {
  /** #ignore */
  private generic = TestDir.getGenericTypes();

  /** #ignore */
  private nonGeneric = TestDir.getNonGenericTypes();

  /** string | undefined */
  decoratorInput = this.generic.decoratorInput;

  /** number | undefined */
  signalInput = this.generic.signalInput;

  /** string | undefined */
  signalInputWithTransform = this.generic.signalInputWithTransform;

  /** number | undefined */
  model = this.generic.model;

  /** WritableSignal<string> */
  nonInputSignal = this.generic.nonInputSignal;

  /** any */
  decoratorInputNonGeneric = this.nonGeneric.decoratorInput;

  /** any */
  signalInputNonGeneric = this.nonGeneric.signalInput;
}

@Directive()
export class TestDir {
  @Input() decoratorInput = 'hello';

  signalInput = input(1);

  signalInputWithTransform = input('hello', {
    transform: (value: number) => value.toString(),
  });

  model = model(1);

  nonInputSignal = signal('hello');

  static getGenericTypes() {
    const changes: SimpleChanges<TestDir> = null!;

    return {
      decoratorInput: changes.decoratorInput?.currentValue,
      signalInput: changes.signalInput?.currentValue,
      signalInputWithTransform: changes.signalInputWithTransform?.currentValue,
      model: changes.model?.currentValue,
      nonInputSignal: changes.nonInputSignal!.currentValue,
    };
  }

  static getNonGenericTypes() {
    const changes: SimpleChanges = null!;

    return {
      decoratorInput: changes['decoratorInput'].currentValue,
      signalInput: changes['signalInput'].currentValue,
    };
  }
}
