import {Component} from '@angular/core';

@Component({
    template: `
    <div>
      {{message}}
      @if (value() === 1) {
        one
      } @else if (otherValue() === 2) {
        two
      } @else if (message) {
        three
      } @else {
        four
      }
    </div>
  `,
    standalone: false
})
export class MyApp {
  message = 'hello';
  value = () => 1;
  otherValue = () => 2;
}
