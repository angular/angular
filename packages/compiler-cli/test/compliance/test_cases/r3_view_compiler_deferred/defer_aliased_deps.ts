import {Component} from '@angular/core';

import {Dep as AliasedDep} from './defer_aliased_deps_a';

@Component({
  template: `
    @defer {
      <dep-a/>
    }
  `,
  imports: [AliasedDep],
})
export class MyApp {
}
