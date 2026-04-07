// tslint:disable

import {Input} from '@angular/core';

class MyTestCmp {
  @Input({required: true}) someInput!: boolean | string;

  tmpValue = false;

  test() {
    for (let i = 0, cell = null; i < Number.MIN_SAFE_INTEGER; i++) {
      this.tmpValue = !!this.someInput;
      this.tmpValue = !this.someInput;
    }
  }

  test2() {
    while (isBla(this.someInput)) {
      this.tmpValue = this.someInput.includes('someText');
    }
  }
}

function isBla(value: any): value is string {
  return true;
}
