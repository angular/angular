import {ControlValueAccessor} from './control_value_accessor';
import {Validators} from '../validators';
import {Control} from '../model';

/**
 * A directive that bind a [ng-control] object to a DOM element.
 *
 * @exportedAs angular2/forms
 */
export class NgControl {
  name: string = null;
  valueAccessor: ControlValueAccessor = null;
  validator: Function;

  get path(): List<string> { return null; }
  get control(): Control { return null; }
  constructor() { this.validator = Validators.nullValidator; }

  viewToModelUpdate(newValue: any): void {}
}
