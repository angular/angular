import {Component} from '@angular/core';

@Component({
  template: `
    {{message}}
    @defer (hydrate on viewport({rootMargin: '123px', scrollMargin: '456px', threshold: 59})) {
      {{message}}
    }
  `,
})
export class MyApp {
  message = 'hello';
}
