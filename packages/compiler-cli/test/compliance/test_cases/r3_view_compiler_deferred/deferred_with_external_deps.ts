import {Component} from '@angular/core';

import {EagerDep} from './deferred_with_external_deps_eager';
import {LazyDep} from './deferred_with_external_deps_lazy';
import {LoadingDep} from './deferred_with_external_deps_loading';

@Component({
  template: `
    <div>
      <eager-dep/>
      @defer {
        <lazy-dep/>
      } @loading {
        <loading-dep/>
      }
    </div>
  `,
  imports: [EagerDep, LazyDep, LoadingDep],
})
export class MyApp {
}
