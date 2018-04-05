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
 * An interface that `FormGroupDirective` and `NgForm` implement.
 *
 * Only used by the forms module.
 *
 *
 */
export interface Form {
  /**
   * Add a control to this form.
   */
  addControl(dir: NgControl): void;

  /**
   * Remove a control from this form.
   */
  removeControl(dir: NgControl): void;

  /**
   * Look up the `FormControl` associated with a particular `NgControl`.
   */
  getControl(dir: NgControl): FormControl;

  /**
   * Add a group of controls to this form.
   */
  addFormGroup(dir: AbstractFormGroupDirective): void;

  /**
   * Remove a group of controls from this form.
   */
  removeFormGroup(dir: AbstractFormGroupDirective): void;

  /**
   * Look up the `FormGroup` associated with a particular `AbstractFormGroupDirective`.
   */
  getFormGroup(dir: AbstractFormGroupDirective): FormGroup;

  /**
   * Update the model for a particular control with a new value.
   */
  updateModel(dir: NgControl, value: any): void;
}
