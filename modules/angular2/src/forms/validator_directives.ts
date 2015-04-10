import {Decorator} from 'angular2/angular2';

import {ControlDirective, Validators} from 'angular2/forms';

@Decorator({
  selector: '[required]'
})
export class RequiredValidatorDirective {
  constructor(c:ControlDirective) {
    c.validator = Validators.compose([c.validator, Validators.required]);
  }
}