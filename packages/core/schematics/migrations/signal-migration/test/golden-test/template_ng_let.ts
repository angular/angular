// tslint:disable

import {Component, Input} from '@angular/core';

@Component({
  template: `
    @let sum = one + two;
    @let three = this.three;
    {{ sum }} {{ three }}
  `,
})
export class MyComp {
  @Input() one = 1;
  @Input() two = 2;
  @Input() three = 3;
}
