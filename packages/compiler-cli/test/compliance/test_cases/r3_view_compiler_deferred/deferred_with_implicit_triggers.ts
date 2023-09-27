import {Component} from '@angular/core';

@Component({
  template: `
    @defer (on hover, interaction, viewport; prefetch on hover, interaction, viewport) {
      {{message}}
    } @placeholder {
      <button>Click me</button>
    }
  `,
})
export class MyApp {
  message = 'hello';
}
