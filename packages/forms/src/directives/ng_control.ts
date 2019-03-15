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
import {composeAsyncValidators, composeValidators} from './shared';
import {AsyncValidator, AsyncValidatorFn, Validator, ValidatorFn} from './validators';

function unimplemented(): any {
  throw new Error('unimplemented');
}

/**
 * @description
 * A base class that all control `FormControl`-based directives extend. It binds a `FormControl`
 * object to a DOM element.
 *
 * @publicApi
 */
export abstract class NgControl extends AbstractControlDirective {
  /**
   * @description
   * The parent form for the control.
   *
   * @internal
   */
  _parent: ControlContainer|null = null;

  /**
   * @description
   * The name for the control
   */
  name: string|null = null;

  /**
   * @description
   * The value accessor for the control
   */
  valueAccessor: ControlValueAccessor|null = null;

  /**
   * @description
   * The uncomposed array of synchronous validators for the control
   *
   * @internal
   */
  _rawValidators: Array<Validator|ValidatorFn> = [];

  /**
   * @description
   * The uncomposed array of async validators for the control
   *
   * @internal
   */
  _rawAsyncValidators: Array<AsyncValidator|AsyncValidatorFn> = [];

  /**
   * @description
   * The synchronous validator for the control (composed on the first call of the validator getter)
   *
   * @internal
   */
  _validator: ValidatorFn|null|undefined;

  /**
   * @description
   * The async validator for the control (composed on the first call of the asyncValidator getter)
   *
   * @internal
   */
  _asyncValidator: AsyncValidatorFn|null|undefined;

  /**
   * @description
   * A function to call to unbind the directive from the form control.
   *
   * @internal
   */
  _unbind: undefined|(() => void);

  /**
   * @description
   * The registered synchronous validator function for the control
   */
  get validator(): ValidatorFn|null {
    if (this._validator === undefined) {
      this._validator = composeValidators(this._rawValidators);
    }
    return this._validator;
  }

  /**
   * @description
   * The registered async validator function for the control
   */
  get asyncValidator(): AsyncValidatorFn|null {
    if (this._asyncValidator === undefined) {
      this._asyncValidator = composeAsyncValidators(this._rawAsyncValidators);
    }
    return this._asyncValidator;
  }

  /**
   * @description
   * The callback method to update the model from the view when requested
   *
   * @param newValue The new value for the view
   */
  abstract viewToModelUpdate(newValue: any): void;
}
