import {Component} from '@angular/core';

@Component({
  template: `
    <div>
      {{message}}
      @if (value()) {
        hello
      }
    </div>
  `,
})
export class MyApp {
  message = 'hello';
  value = () => 1;
}
