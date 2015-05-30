import {FormDirective} from './form_directive';
import {List} from 'angular2/src/facade/collection';

export class ControlContainerDirective {
  name: string;
  get formDirective(): FormDirective { return null; }
  get path(): List<string> { return null; }
}
