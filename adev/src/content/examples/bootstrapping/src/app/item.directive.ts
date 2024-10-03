// #docplaster
// #docregion directive

import {Directive} from '@angular/core';

@Directive({
  selector: '[appItem]',
  standalone: false,
})
export class ItemDirective {
  // code goes here
  constructor() {}
}
// #enddocregion directive
