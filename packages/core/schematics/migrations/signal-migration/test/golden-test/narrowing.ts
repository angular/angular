// tslint:disable

import {Input, Directive} from '@angular/core';

@Directive()
export class Narrowing {
  @Input() name: string | undefined = undefined;

  narrowingArrowFn() {
    [this].map((x) => x.name && x.name.charAt(0));
  }

  narrowingObjectExpansion() {
    [this].map(({name}) => name && name.charAt(0));
  }

  narrowingNormalThenObjectExpansion() {
    if (this.name) {
      const {charAt} = this.name;
      charAt(0);
    }
  }
}
