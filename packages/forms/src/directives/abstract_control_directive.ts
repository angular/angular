/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Observable} from 'rxjs';
import {AbstractControl} from '../model';
import {ValidationErrors} from './validators';

/**
 * @description
 * Base class for control directives.
 *
 * This class is only used internally in the `FormsModule`.
 *
 */
export abstract class AbstractControlDirective {
  /**
   * @description
   * A reference to the underlying control.
   *
   * @returns the control that backs this directive. Most properties fall through to that instance.
   */
  abstract get control(): AbstractControl|null;

  /**
   * @description
   * The value of the control.
   *
   * @returns The value of the control if it is present, otherwise null.
   */
  get value(): any { return this.control ? this.control.value : null; }

  /**
   * @description
   * Reports that the control is valid, meaning that no errors exist in the input value.
   *
   * @returns The control's valid state if the control is present, otherwise null.
   */
  get valid(): boolean|null { return this.control ? this.control.valid : null; }

  /**
   * @description
   * Reports that the control is invalid, meaning that an error exists in the input value.
   *
   * @returns The control's invalid state if the control is present, otherwise null.
   */
  get invalid(): boolean|null { return this.control ? this.control.invalid : null; }

  /**
   * @description
   * Reports that a control is pending, meaning that that async validation is occurring and
   * errors are not yet available for the input value.
   *
   * @returns The control's pending state if the control is present, otherwise null.
   */
  get pending(): boolean|null { return this.control ? this.control.pending : null; }

  /**
   * @description
   * Reports that the control is disabled, meaning that the control is exempt from ancestor
   * calculations of validity or value.
   *
   * @returns The control's disabled state if the control is present, otherwise null.
   */
  get disabled(): boolean|null { return this.control ? this.control.disabled : null; }

  /**
   * @description
   * Reports that the control is enabled, meaning that the control is included in ancestor
   * calculations of validity or value.
   *
   * @returns The control's enabled state if the control is present, otherwise null.
   */
  get enabled(): boolean|null { return this.control ? this.control.enabled : null; }

  /**
   * @description
   * Reports the FormControl validation errors.
   *
   * @returns The control's validation errors if the control is present, otherwise null.
   */
  get errors(): ValidationErrors|null { return this.control ? this.control.errors : null; }

  /**
   * @description
   * Reports that the control is pristine, meaning that the control the user has not yet changed
   * the value in the UI.
   *
   * @returns The control's pristine state if the control is present, otherwise null.
   */
  get pristine(): boolean|null { return this.control ? this.control.pristine : null; }

  /**
   * @description
   * Reports that the control is dirty, meaning that the control the user has changed
   * the value in the UI.
   *
   * @returns The control's dirty state if the control is present, otherwise null.
   */
  get dirty(): boolean|null { return this.control ? this.control.dirty : null; }

  /**
   * @description
   * Reports that the control is touched, meaning that the the user has triggered
   * a `blur` event on it.
   *
   * @returns The control's touched state if the control is present, otherwise null.
   */
  get touched(): boolean|null { return this.control ? this.control.touched : null; }

  /**
   * @description
   * Reports that a FormControl is touched, meaning that the the user has triggered
   * a `blur` event on it.
   *
   * @returns The control's touched state if the control is present, otherwise null.
   */
  get status(): string|null { return this.control ? this.control.status : null; }

  /**
   * @description
   * Reports that a FormControl is untouched, meaning that the the user has not yet triggered
   * a `blur` event on it.
   *
   * @returns The control's untouched state if the control is present, otherwise null.
   */
  get untouched(): boolean|null { return this.control ? this.control.untouched : null; }

  /**
   * @description
   * Reports the observable of status changes for the control.
   *
   * @returns An observable that emits every time the validation status of the control
   * is re-calculated if the control is present, otherwise null.
   */
  get statusChanges(): Observable<any>|null {
    return this.control ? this.control.statusChanges : null;
  }

  /**
   * @description
   * Reports the observable of value changes for the control.
   *
   * @returns An observable that emits every time the value of the control
   * changes in the UI or programmatically if the control is present, otherwise null.
   */
  get valueChanges(): Observable<any>|null {
    return this.control ? this.control.valueChanges : null;
  }

  /**
   * @description
   * Reports an array that represents the path from the top-level form to this control.
   * Each index is the string name of the control on that level.
   *
   */
  get path(): string[]|null { return null; }

  /**
   * @description
   * Resets the control with the provided value if the control is present
   *
   */
  reset(value: any = undefined): void {
    if (this.control) this.control.reset(value);
  }

  /**
   * @description
   * Reports whether the control with the given path has the error specified.
   * If no path is given, it checks for the error on the present control.
   *
   * @returns True if the control is present and has the error specified, otherwise false
   */
  hasError(errorCode: string, path?: string[]): boolean {
    return this.control ? this.control.hasError(errorCode, path) : false;
  }

  /**
   * @description
   * Reports error data for the control with the given path. Otherwise
   * returns null or undefined.
   *
   * @returns The control's error if the control is present, otherwise null
   */
  getError(errorCode: string, path?: string[]): any {
    return this.control ? this.control.getError(errorCode, path) : null;
  }
}
