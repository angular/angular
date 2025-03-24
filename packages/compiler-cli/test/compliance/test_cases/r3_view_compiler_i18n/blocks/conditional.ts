import {Component} from '@angular/core';

@Component({
    template: `
    <div i18n>
      Content:
      @if (count === 0) {
        before<span>zero</span>after
      } @else if (count === 1) {
        before<div>one</div>after
      } @else {
        before<button>otherwise</button>after
      }!

      @if (count === 7) {
        before<span>seven</span>after
      }
    </div>
  `,
    standalone: false
})
export class MyApp {
  count = 0;
}
