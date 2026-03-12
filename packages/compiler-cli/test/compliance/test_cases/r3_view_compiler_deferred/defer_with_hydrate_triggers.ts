import {Component} from '@angular/core';

@Component({
  template: `
    {{message}}
    @defer (
      hydrate when isVisible() || isReady;
      hydrate on idle, timer(1337);
      hydrate on immediate, hover;
      hydrate on interaction;
      hydrate on viewport) {
      {{message}}
    }
  `,
})
export class MyApp {
  message = 'hello';
  isReady = true;

  isVisible() {
    return false;
  }
}
