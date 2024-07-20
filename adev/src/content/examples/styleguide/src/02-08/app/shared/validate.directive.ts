// #docregion
import {Directive} from '@angular/core';

// #docregion example
@Directive({
  standalone: true,
  selector: '[tohValidate]',
})
export class ValidateDirective {}
// #enddocregion example
