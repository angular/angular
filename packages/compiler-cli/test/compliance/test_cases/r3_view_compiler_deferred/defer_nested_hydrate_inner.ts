import {Component} from '@angular/core';

@Component({
  selector: 'inner-cmp',
  template: `
    @defer (hydrate on idle) {
      hello
    }
  `,
})
export class InnerCmp {
}
