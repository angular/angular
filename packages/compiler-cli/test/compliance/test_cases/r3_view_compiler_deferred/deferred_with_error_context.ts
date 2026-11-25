import {Component} from '@angular/core';
import {ErrorContextCmp} from './deferred_with_error_context_dep';

@Component({
  imports: [ErrorContextCmp],
  template: `
    @defer {
      <error-context-cmp />
    } @error (let err, again = $retry) {
      <p>{{ $error.message }} {{ err.name }}</p>
      <button (click)="again()">Retry</button>
    }
  `,
})
export class MyApp {}
