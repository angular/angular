import {Component} from '@angular/core';

@Component({
    template: `
    <div>
      {{message}}
      @if (val === 0) {
        zero
      } @else if (val === 1) {
        one
      } @else if (val === 2) {
        @if (innerVal === 0) {
          inner zero
        } @else if (innerVal === 1) {
          inner one
        } @else if (innerVal === 2) {
          inner two
        } @else {
          inner three
        }
      } @else {
        three
      }
    </div>
  `,
    standalone: false
})
export class MyApp {
  message = 'hello';
  val = 1;
  innerVal = 2;
}
