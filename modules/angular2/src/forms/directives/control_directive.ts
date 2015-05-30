import {ControlValueAccessor} from './control_value_accessor';
import {Validators} from '../validators';

export class ControlDirective {
  name: string = null;
  valueAccessor: ControlValueAccessor = null;
  validator: Function;

  get path(): List<string> { return null; }
  constructor() { this.validator = Validators.nullValidator; }
}
