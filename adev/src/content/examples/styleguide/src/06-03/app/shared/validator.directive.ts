/* eslint-disable @angular-eslint/no-host-metadata-property */
// #docregion
import { Directive } from '@angular/core';

@Directive({
  standalone: true,
  selector: '[tohValidator]',
  host: {
    '[attr.role]': 'role',
    '(mouseenter)': 'onMouseEnter()'
  }
})
export class ValidatorDirective {
  role = 'button';
  onMouseEnter() {
    // do work
  }
}
