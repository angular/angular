import {Component} from '@angular/core';
import {LinkedRetryCmp} from './deferred_with_error_retry_linked_dep';

@Component({
  imports: [LinkedRetryCmp],
  template: `
    <div>
      @defer (when isVisible) {
        <linked-retry-cmp />
      } @placeholder {
        <p>Placeholder</p>
      } @error (retry 3) {
        <p>Failed!</p>
      }
    </div>
  `,
})
export class LinkedRetryApp {
  isVisible = false;
}
