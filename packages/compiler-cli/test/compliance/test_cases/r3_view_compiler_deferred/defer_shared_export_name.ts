import {Component} from '@angular/core';

import {Dep as AliasedDepA} from './defer_aliased_deps_a';
import {Dep as AliasedDepB} from './defer_aliased_deps_b';

@Component({
  template: `
    @defer {
      <dep-a/>
      <dep-b/>
    }
  `,
  imports: [AliasedDepA, AliasedDepB],
})
export class MyApp {
}
