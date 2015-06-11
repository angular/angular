import {Directive} from '../../../angular2';
import {Validators} from '../validators';
import {NgControl} from '../directives';

@Directive({selector: '[required][ng-control],[required][ng-form-control],[required][ng-model]'})
export class NgRequiredValidator {
  constructor(c: NgControl) {
    c.validator = Validators.compose([c.validator, Validators.required]);
  }
}
