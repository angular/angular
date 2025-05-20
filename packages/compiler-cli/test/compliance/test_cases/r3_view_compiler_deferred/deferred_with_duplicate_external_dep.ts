import {Component} from '@angular/core';
import {DuplicateLazyDep} from './deferred_with_duplicate_external_dep_lazy';
import {OtherLazyDep} from './deferred_with_duplicate_external_dep_other';

@Component({
  template: `
    @defer {
      <duplicate-lazy-dep/>
    }

    @defer {
      <duplicate-lazy-dep/>
    }

    @defer {
      <other-lazy-dep/>
    }
  `,
  imports: [DuplicateLazyDep, OtherLazyDep],
})
export class MyApp {}
