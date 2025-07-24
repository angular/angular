// tslint:disable

import {Directive, Input} from '@angular/core';

export class OtherCmp {
  @Input() name = false;
}

@Directive()
export class MyComp {
  @Input() name = '';
  other: OtherCmp = null!;

  @Input() scroller = {fn: () => {}, other: (x?: any) => {}};

  click() {
    if (this.name) {
      console.error(this.name);
    }

    if (this.other.name) {
      console.error(this.other.name);
    }
  }

  onOverlayAnimationStart() {
    if (global) {
      console.log('some statements');
      console.log('some statements');

      if (window) {
        this.scroller?.fn();
        this.scroller.other();
      }
      if (window) {
        this.scroller?.other(true as any);
      }
    }
  }
}
