import {NgControl} from './ng_control';
import {NgControlGroup} from './ng_control_group';
import {Control, ControlGroup} from '../model';

/**
 * An interface that {@link NgFormModel} and {@link NgForm} implement.
 *
 * Only used by the forms module.
 */
export interface Form {
  addControl(dir: NgControl): void;
  removeControl(dir: NgControl): void;
  getControl(dir: NgControl): Control;
  addControlGroup(dir: NgControlGroup): void;
  removeControlGroup(dir: NgControlGroup): void;
  getControlGroup(dir: NgControlGroup): ControlGroup;
  updateModel(dir: NgControl, value: any): void;
}