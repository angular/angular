import {Form} from './form_interface';
import {AbstractControlDirective} from './abstract_control_directive';

/**
 * A directive that contains multiple {@link NgControl}.
 *
 * Only used by the forms module.
 */
export class ControlContainer extends AbstractControlDirective {
  name: string;
  get formDirective(): Form { return null; }
  get path(): string[] { return null; }
}
