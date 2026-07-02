// tslint:disable

import {Component, Input} from '@angular/core';

@Component({
  template: `
    {foo, plural,
      =0 {{bar, plural, =0 {zero} other {zero, <b>bar is {{ bar }}</b>}}}
      other {foo is {{ foo }}}
    }
  `,
})
export class MyComp {
  @Input() foo = 0;
  @Input() bar = 0;
}
