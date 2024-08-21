// tslint:disable

import {Input} from '@angular/core';

export class TestCmp {
  @Input() shared = false;

  bla() {
    if (TestCmp.arguments) {
      this.someFn(this.shared);
    } else {
      this.shared.valueOf();
    }

    this.someFn(this.shared);
  }

  someFn(bla: boolean): asserts bla is true {}
}
