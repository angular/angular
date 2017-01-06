/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */


import {AbstractControlDirective} from './abstract_control_directive';
import {ControlContainer} from './control_container';
import {ControlValueAccessor} from './control_value_accessor';
import {AsyncValidatorFn, Validator, ValidatorFn} from './validators';

function unimplemented(): any {
  throw new Error('unimplemented');
}

/**
 * A base class that all control directive extend.
 * It binds a {@link FormControl} object to a DOM element.
 *
 * Used internally by Angular forms.
 *
 * @stable
 */
export abstract class NgControl extends AbstractControlDirective {
  /** @internal */
  _parent: ControlContainer = null;
  name: string = null;
  valueAccessor: ControlValueAccessor = null;
  /** @internal */
  _rawValidators: Array<Validator|ValidatorFn> = [];
  /** @internal */
  _rawAsyncValidators: Array<Validator|ValidatorFn> = [];

  get validator(): ValidatorFn { return <ValidatorFn>unimplemented(); }
  get asyncValidator(): AsyncValidatorFn { return <AsyncValidatorFn>unimplemented(); }

  abstract viewToModelUpdate(newValue: any): void;
}
