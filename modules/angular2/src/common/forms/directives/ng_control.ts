import {ControlValueAccessor} from './control_value_accessor';
import {AbstractControlDirective} from './abstract_control_directive';
import {unimplemented} from 'angular2/src/facade/exceptions';

/**
 * A base class that all control directive extend.
 * It binds a {@link Control} object to a DOM element.
 *
 * Used internally by Angular forms.
 */
export abstract class NgControl extends AbstractControlDirective {
  name: string = null;
  valueAccessor: ControlValueAccessor = null;

  get validator(): Function { return unimplemented(); }
  get asyncValidator(): Function { return unimplemented(); }

  abstract viewToModelUpdate(newValue: any): void;
}
