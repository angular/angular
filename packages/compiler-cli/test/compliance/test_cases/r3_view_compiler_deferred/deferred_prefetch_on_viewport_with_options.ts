import {Component} from '@angular/core';

@Component({
  template: `
    {{message}}
    @defer (prefetch on viewport({trigger: button, rootMargin: '123px', threshold: 59})) {
      {{message}}
    } @placeholder {
      <button #button>Click me</button>
    }
  `,
})
export class MyApp {
  message = 'hello';
}
