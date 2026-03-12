// tslint:disable

import {Input} from '@angular/core';

export class TestCmp {
  @Input() shared: {x: string} = {x: ''};

  bla() {
    this.shared.x = this.doSmth(this.shared);

    this.doSmth(this.shared);
  }

  doSmth(v: typeof this.shared): string {
    return v.x;
  }
}
