import {FormControl, FormGroup} from '../model';

import {NgControl} from './ng_control';
import {NgControlGroup} from './ng_control_group';


/**
 * An interface that {@link NgFormModel} and {@link NgForm} implement.
 *
 * Only used by the forms module.
 *
 * @experimental
 */
export interface Form {
  /**
   * Add a control to this form.
   */
  addControl(dir: NgControl): FormControl;

  /**
   * Remove a control from this form.
   */
  removeControl(dir: NgControl): void;

  /**
   * Look up the {@link Control} associated with a particular {@link NgControl}.
   */
  getControl(dir: NgControl): FormControl;

  /**
   * Add a group of controls to this form.
   */
  addFormGroup(dir: NgControlGroup): void;

  /**
   * Remove a group of controls from this form.
   */
  removeFormGroup(dir: NgControlGroup): void;

  /**
   * Look up the {@link FormGroup} associated with a particular {@link NgControlGroup}.
   */
  getFormGroup(dir: NgControlGroup): FormGroup;

  /**
   * Update the model for a particular control with a new value.
   */
  updateModel(dir: NgControl, value: any): void;
}
