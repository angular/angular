/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {FormControl} from '../model/form_control';
import {FormGroup} from '../model/form_group';

import {AbstractFormGroupDirective} from './abstract_form_group_directive';
import {NgControl} from './ng_control';



/**
 * @description
 * An interface implemented by `FormGroupDirective` and `NgForm` directives.
 *
 * Only used by the `ReactiveFormsModule` and `FormsModule`.
 *
 * @publicApi
 */
export interface Form {
  /**
   * @description
   * Add a control to this form.
   *
   * @param dir The control directive to add to the form.
   */
  addControl(dir: NgControl): void;

  /**
   * @description
   * Remove a control from this form.
   *
   * @param dir: The control directive to remove from the form.
   */
  removeControl(dir: NgControl): void;

  /**
   * @description
   * The control directive from which to get the `FormControl`.
   *
   * @param dir: The control directive.
   */
  getControl(dir: NgControl): FormControl;

  /**
   * @description
   * Add a group of controls to this form.
   *
   * @param dir: The control group directive to add.
   */
  addFormGroup(dir: AbstractFormGroupDirective): void;

  /**
   * @description
   * Remove a group of controls to this form.
   *
   * @param dir: The control group directive to remove.
   */
  removeFormGroup(dir: AbstractFormGroupDirective): void;

  /**
   * @description
   * The `FormGroup` associated with a particular `AbstractFormGroupDirective`.
   *
   * @param dir: The form group directive from which to get the `FormGroup`.
   */
  getFormGroup(dir: AbstractFormGroupDirective): FormGroup;

  /**
   * @description
   * Update the model for a particular control with a new value.
   *
   * @param dir: The control directive to update.
   * @param value: The new value for the control.
   */
  updateModel(dir: NgControl, value: any): void;
}
