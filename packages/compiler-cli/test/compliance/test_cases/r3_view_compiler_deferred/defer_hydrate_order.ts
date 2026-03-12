import {Component} from '@angular/core';

@Component({
  template: `
    @defer (when isReady; hydrate on timer(1337); prefetch on viewport) {
      Hello
    } @placeholder {
      <span>Placeholder</span>
    }
  `,
})
export class MyApp {
  isReady = true;
}
