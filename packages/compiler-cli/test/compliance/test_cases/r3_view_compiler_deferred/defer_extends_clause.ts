import {Component} from '@angular/core';
import {DeferDep, BaseCmp} from './defer_extends_clause_deps';

@Component({
  template: `
    @defer {
      <defer-dep/>
    }
  `,
  imports: [DeferDep],
})
export class MyApp extends BaseCmp {}
