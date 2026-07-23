import {Component} from '@angular/core';
import {MyCounterCmp} from './deferred_import_alias_index';

@Component({
  selector: 'test-cmp',
  standalone: true,
  imports: [MyCounterCmp],
  template: `
    @defer {
      <my-counter-cmp />
    }
  `,
})
export class TestCmp {}
