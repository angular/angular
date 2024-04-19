// #docregion
import {Directive, HostBinding, HostListener} from '@angular/core';

@Directive({
  standalone: true,
  selector: '[tohValidator]',
})
export class ValidatorDirective {
  @HostBinding('attr.role') role = 'button';
  @HostListener('mouseenter') onMouseEnter() {
    // do work
  }
}
