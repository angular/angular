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
   * The registered synchronous validator function for the control
   *
   * @throws An exception that this method is not implemented
   */
  get validator(): ValidatorFn|null { return <ValidatorFn>unimplemented(); }

  /**
   * @description
   * The registered async validator function for the control
   *
   * @throws An exception that this method is not implemented
   */
  get asyncValidator(): AsyncValidatorFn|null { return <AsyncValidatorFn>unimplemented(); }

  /**
   * @description
   * The callback method to update the model from the view when requested
   *
   * @param newValue The new value for the view
   */
  abstract viewToModelUpdate(newValue: any): void;
}
