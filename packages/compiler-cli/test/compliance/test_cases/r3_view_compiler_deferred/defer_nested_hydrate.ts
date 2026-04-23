import {Component} from '@angular/core';

import {InnerCmp} from './defer_nested_hydrate_inner';

@Component({
  selector: 'my-app',
  imports: [InnerCmp],
  template: `
    @defer (on idle) {
      <inner-cmp />
    }
  `,
})
export class MyApp {}
