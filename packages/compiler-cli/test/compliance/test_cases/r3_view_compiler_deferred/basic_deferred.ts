import {Component} from '@angular/core';

@Component({
    template: `
    <div>
      {{message}}
      @defer {Deferred content}
      <p>Content after defer block</p>
    </div>
  `,
    standalone: false
})
export class MyApp {
  message = 'hello';
}
