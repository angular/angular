import {Directive} from '../../../angular2';
import {Validators} from '../validators';
import {NgControl} from '../directives';

@Directive({selector: '[required]'})
export class NgRequiredValidator {
  constructor(c: NgControl) {
    c.validator = Validators.compose([c.validator, Validators.required]);
  }
}
