import {Decorator} from 'angular2/core';

import {ControlDirective} from 'angular2/forms';
import * as validators from 'angular2/forms';

@Decorator({
  selector: '[required]'
})
export class RequiredValidatorDirective {
  constructor(c:ControlDirective) {
    c.validator = validators.compose([c.validator, validators.required]);
  }
}