import {Component} from '@angular/core';

@Component({
  template: `
    <div>
      {{message}}
      @if (one; as alias) {
        {{alias}}
      } @else if (two; as alias) {
        {{alias}}
      }
    </div>
  `,
})
export class MyApp {
  message = 'hello';
  one = false;
  two = 2;
}
