import {Component} from '@angular/core';

@Component({
  template: `
    <div>
      {{message}}
      @if (one) {
        {{one}}
      } @else if (value(); as alias) {
        {{value()}} as {{alias}}
      }
    </div>
  `,
})
export class MyApp {
  message = 'hello';
  one = false;
  value = () => 1;
}
