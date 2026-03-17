import {Component} from '@angular/core';

@Component({
    template: `
    @defer (on idle(500ms)) {
      {{message}}
    } @placeholder {
      <p>Placeholder</p>
    }
  `,
})
export class MyApp {
  message = 'hello';
}
