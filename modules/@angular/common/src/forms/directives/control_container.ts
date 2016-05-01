import {Form} from './form_interface';
import {AbstractControlDirective} from './abstract_control_directive';

/**
 * A directive that contains multiple {@link NgControl}s.
 *
 * Only used by the forms module.
 */
export class ControlContainer extends AbstractControlDirective {
  name: string;

  /**
   * Get the form to which this container belongs.
   */
  get formDirective(): Form { return null; }

  /**
   * Get the path to this container.
   */
  get path(): string[] { return null; }
}
