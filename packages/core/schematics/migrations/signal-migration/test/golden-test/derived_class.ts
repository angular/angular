// tslint:disable

import {Input, Directive} from '@angular/core';

@Directive()
class Base {
  @Input() bla = true;
}

class Derived extends Base {
  override bla = false;
}

// overridden in separate file
@Directive()
export class Base2 {
  @Input() bla = true;
}

// overridden in separate file
@Directive()
export class Base3 {
  @Input() bla = true;

  click() {
    this.bla = false;
  }
}
