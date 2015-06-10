import {Form} from './form_interface';
import {List} from 'angular2/src/facade/collection';

/**
 * A directive that contains a group of [NgControl].
 *
 * @exportedAs angular2/forms
 */
export class ControlContainer {
  name: string;
  get formDirective(): Form { return null; }
  get path(): List<string> { return null; }
}
