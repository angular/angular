/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {FormControl, FormGroup} from '../model';

import {AbstractFormGroupDirective} from './abstract_form_group_directive';
import {NgControl} from './ng_control';



/**
 * @description
 * An interface implemented by `FormGroupDirective` and `NgForm` directives.
 *
 * Only used by the `FormsModule`.
 */
export interface Form {
  /**
   * @description
   * Add a control to this form.
   *
   * @param dir The control to add to the form
   */
  addControl(dir: NgControl): void;

  /**
   * @description
   * Remove a control from this form.
   *
   * @param dir: The control to remove from the form
   */
  removeControl(dir: NgControl): void;

  /**
   * @description
   * Reports the `FormControl` associated with the provided `NgControl`.
   *
   * @param dir: The form control instance
   */
  getControl(dir: NgControl): FormControl;

  /**
   * @description
   * Add a group of controls to this form.
   *
   * @param dir: The control group to remove
   */
  addFormGroup(dir: AbstractFormGroupDirective): void;

  /**
   * @description
   * Remove a group of controls to this form.
   *
   * @param dir: The control group to remove
   */
  removeFormGroup(dir: AbstractFormGroupDirective): void;

  /**
   * @description
   * Reports the form group for the provided control
   *
   * @param dir: The form group to query
   */
  getFormGroup(dir: AbstractFormGroupDirective): FormGroup;

  /**
   * @description
   * Update the model for a particular control with a new value.
   *
   * @param dir: The control to update
   * @param value: The new value for the control
   */
  updateModel(dir: NgControl, value: any): void;
}
