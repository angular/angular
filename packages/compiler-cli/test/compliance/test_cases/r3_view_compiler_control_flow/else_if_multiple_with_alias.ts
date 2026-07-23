import {Component} from '@angular/core';

@Component({
  template: `
    <div>
      {{message}}
      @if (one; as foo) {
        One: {{foo}}
      } @else if (two) {
        Two: {{two}}
      } @else if (three; as bar) {
        Three: {{bar}}
      } @else if (four; as baz) {
        Four: {{baz}}
      } @else if (five) {
        Five: {{five}}
      }
    </div>
  `,
})
export class MyApp {
  message = 'hello';
  one = 1;
  two = 2;
  three = 3;
  four = 4;
  five = 5;
}
