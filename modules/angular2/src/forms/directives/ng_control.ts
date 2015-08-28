import {ControlValueAccessor} from './control_value_accessor';
import {AbstractControlDirective} from './abstract_control_directive';

/**
 * An abstract class that all control directive extend.
 *
 * It binds a {@link Control} object to a DOM element.
 */
export class NgControl extends AbstractControlDirective {
  name: string = null;
  valueAccessor: ControlValueAccessor = null;

  get validator(): Function { return null; }
  get path(): string[] { return null; }

  viewToModelUpdate(newValue: any): void {}
}
