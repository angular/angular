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
 * This class is only used internally in the `ReactiveFormsModule` and the `FormsModule`.
 *
 * @publicApi
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
   * Reports the value of the control if it is present, otherwise null.
   */
  get value(): any { return this.control ? this.control.value : null; }

  /**
   * @description
   * Reports whether the control is valid. A control is considered valid if no
   * validation errors exist with the current value.
   * If the control is not present, null is returned.
   */
  get valid(): boolean|null { return this.control ? this.control.valid : null; }

  /**
   * @description
   * Reports whether the control is invalid, meaning that an error exists in the input value.
   * If the control is not present, null is returned.
   */
  get invalid(): boolean|null { return this.control ? this.control.invalid : null; }

  /**
   * @description
   * Reports whether a control is pending, meaning that that async validation is occurring and
   * errors are not yet available for the input value. If the control is not present, null is
   * returned.
   */
  get pending(): boolean|null { return this.control ? this.control.pending : null; }

  /**
   * @description
   * Reports whether the control is disabled, meaning that the control is disabled
   * in the UI and is exempt from validation checks and excluded from aggregate
   * values of ancestor controls. If the control is not present, null is returned.
   */
  get disabled(): boolean|null { return this.control ? this.control.disabled : null; }

  /**
   * @description
   * Reports whether the control is enabled, meaning that the control is included in ancestor
   * calculations of validity or value. If the control is not present, null is returned.
   */
  get enabled(): boolean|null { return this.control ? this.control.enabled : null; }

  /**
   * @description
   * Reports the control's validation errors. If the control is not present, null is returned.
   */
  get errors(): ValidationErrors|null { return this.control ? this.control.errors : null; }

  /**
   * @description
   * Reports whether the control is pristine, meaning that the user has not yet changed
   * the value in the UI. If the control is not present, null is returned.
   */
  get pristine(): boolean|null { return this.control ? this.control.pristine : null; }

  /**
   * @description
   * Reports whether the control is dirty, meaning that the user has changed
   * the value in the UI. If the control is not present, null is returned.
   */
  get dirty(): boolean|null { return this.control ? this.control.dirty : null; }

  /**
   * @description
   * Reports whether the control is touched, meaning that the user has triggered
   * a `blur` event on it. If the control is not present, null is returned.
   */
  get touched(): boolean|null { return this.control ? this.control.touched : null; }

  /**
   * @description
   * Reports the validation status of the control. Possible values include:
   * 'VALID', 'INVALID', 'DISABLED', and 'PENDING'.
   * If the control is not present, null is returned.
   */
  get status(): string|null { return this.control ? this.control.status : null; }

  /**
   * @description
   * Reports whether the control is untouched, meaning that the user has not yet triggered
   * a `blur` event on it. If the control is not present, null is returned.
   */
  get untouched(): boolean|null { return this.control ? this.control.untouched : null; }

  /**
   * @description
   * Returns a multicasting observable that emits a validation status whenever it is
   * calculated for the control. If the control is not present, null is returned.
   */
  get statusChanges(): Observable<any>|null {
    return this.control ? this.control.statusChanges : null;
  }

  /**
   * @description
   * Returns a multicasting observable of value changes for the control that emits every time the
   * value of the control changes in the UI or programmatically.
   * If the control is not present, null is returned.
   */
  get valueChanges(): Observable<any>|null {
    return this.control ? this.control.valueChanges : null;
  }

  /**
   * @description
   * Returns an array that represents the path from the top-level form to this control.
   * Each index is the string name of the control on that level.
   */
  get path(): string[]|null { return null; }

  /**
   * @description
   * Resets the control with the provided value if the control is present.
   */
  reset(value: any = undefined): void {
    if (this.control) this.control.reset(value);
  }

  /**
   * @description
   * Reports whether the control with the given path has the error specified.
   * If no path is given, it checks for the error on the present control.
   * If the control is not present, false is returned.
   */
  hasError(errorCode: string, path?: string[]): boolean {
    return this.control ? this.control.hasError(errorCode, path) : false;
  }

  /**
   * @description
   * Reports error data for the control with the given path.
   * If the control is not present, null is returned.
   */
  getError(errorCode: string, path?: string[]): any {
    return this.control ? this.control.getError(errorCode, path) : null;
  }
}
