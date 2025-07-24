// tslint:disable
// prettier-ignore

import {
  Directive,
  Input
} from '@angular/core';

@Directive()
export class TestCmp {
  @Input() disabled = false;
}
