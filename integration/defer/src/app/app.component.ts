import {Component} from '@angular/core';

import {DeferComponent} from './defer.component';

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [DeferComponent],
  template: `
    <h1>Defer feature</h1>

    @defer (when isVisible) {
      <defer-cmp />
    } @loading {
      loading
    } @placeholder {
      Placeholder
    } @error {
      Error
    }
  `,
})
export class AppComponent {
  isVisible = true;
}
