import {ControlValueAccessor} from './control_value_accessor';
import {Control} from '../model';

/**
 * An abstract class that all control directive extend.
 *
 * It binds a {@link Control} object to a DOM element.
 *
 * @exportedAs angular2/forms
 */
export class NgControl {
  name: string = null;
  valueAccessor: ControlValueAccessor = null;

  get validator(): Function { return null; }
  get path(): List<string> { return null; }
  get control(): Control { return null; }

  viewToModelUpdate(newValue: any): void {}
}
