// tslint:disable

import {Input} from '@angular/core';

export class TestCmp {
  @Input() testParenthesisInput = false;
  @Input() notMutated = true;

  testParenthesis() {
    // prettier-ignore
    ((this.testParenthesisInput)) = true;
  }

  testNotMutated() {
    let fixture: boolean;
    fixture = this.notMutated;
  }
}
