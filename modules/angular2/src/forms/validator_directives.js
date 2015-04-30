import {Directive} from 'angular2/src/core/annotations_impl/annotations';

import {Validators} from './validators';
import {ControlDirective} from './directives';

@Directive({
  selector: '[required]'
})
export class RequiredValidatorDirective {
  constructor(c:ControlDirective) {
    c.validator = Validators.compose([c.validator, Validators.required]);
  }
}
