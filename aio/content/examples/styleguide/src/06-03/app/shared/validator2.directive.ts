// #docregion
import { Directive } from '@angular/core';

@Directive({
  selector: '[tohValidator2]',
  host: {
    'attr.role': 'button',
    '(mouseenter)': 'onMouseEnter()'
  }
})
export class Validator2Directive {
  role = 'button';
  onMouseEnter() {
    // do work
  }
}
