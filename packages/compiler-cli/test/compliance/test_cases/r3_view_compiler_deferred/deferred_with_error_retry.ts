import {Component} from '@angular/core';
import {RetryCmp} from './deferred_with_error_retry_dep';

@Component({
  imports: [RetryCmp],
  template: `
    <div>
      @defer (when isVisible) {
        <retry-cmp />
      } @placeholder {
        <p>Placeholder</p>
      } @error (retry 3) {
        <p>Failed!</p>
      }
    </div>
  `,
})
export class MyApp {
  isVisible = false;
}
