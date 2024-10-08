// tslint:disable

import {Directive, Input} from '@angular/core';

export class OtherCmp {
  @Input() name = false;
}

@Directive()
export class MyComp {
  @Input() name = '';
  other: OtherCmp = null!;

  click() {
    if (this.name) {
      console.error(this.name);
    }

    if (this.other.name) {
      console.error(this.other.name);
    }
  }
}
