import {Component, Pipe} from '@angular/core';

@Pipe({name: 'test'})
export class TestPipe {
  transform(value: unknown) {
    return value;
  }
}

@Component({
  template: `
    <div>
      {{message}}
      @if ((val | test) === 1) {
        one
      } @else if ((val | test) === 2) {
        two
      } @else {
        three
      }
    </div>
  `,
  imports: [TestPipe],
})
export class MyApp {
  message = 'hello';
  val = 1;
}
