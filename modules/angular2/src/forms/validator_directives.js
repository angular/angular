import {Decorator} from 'angular2/angular2';

import {Validators} from './validators';
import {ControlDirective} from './directives';

@Decorator({
  selector: '[required]'
})
export class RequiredValidatorDirective {
  constructor(c:ControlDirective) {
    c.validator = Validators.compose([c.validator, Validators.required]);
  }
}