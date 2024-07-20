// #docregion
import {Directive} from '@angular/core';
// #docregion example
/* avoid */

@Directive({
  standalone: true,
  selector: '[validate]',
})
export class ValidateDirective {}
// #enddocregion example
