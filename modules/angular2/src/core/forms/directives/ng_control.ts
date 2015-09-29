import {ControlValueAccessor} from './control_value_accessor';
import {AbstractControlDirective} from './abstract_control_directive';

/**
 * A base class that all control directive extend.
 * It binds a {@link Control} object to a DOM element.
 */
// Cannot currently be abstract because it would contain
// an abstract method in the public API, and we cannot reflect
// on that in Dart due to https://github.com/dart-lang/sdk/issues/18721
// Also we don't have abstract setters, see https://github.com/Microsoft/TypeScript/issues/4669
export class NgControl extends AbstractControlDirective {
  name: string = null;
  valueAccessor: ControlValueAccessor = null;

  get validator(): Function { return null; }
  get path(): string[] { return null; }

  viewToModelUpdate(newValue: any): void {}
}
