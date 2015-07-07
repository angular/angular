import {Form} from './form_interface';
import {AbstractControlDirective} from './abstract_control_directive';
import {List} from 'angular2/src/facade/collection';

/**
 * A directive that contains a group of [NgControl].
 *
 * Only used by the forms module.
 */
export class ControlContainer extends AbstractControlDirective {
  name: string;
  get formDirective(): Form { return null; }
  get path(): List<string> { return null; }
}
