import {Component, Pipe} from '@angular/core';

@Pipe({standalone: true, name: 'test'})
export class TestPipe {
  transform(value: unknown) {
    return value;
  }
}

@Component({
  template: `
    <div>
      {{message}}
      @switch (value() | test) {
        @case (0 | test) {
          case 0
        }
        @case (1 | test) {
          case 1
        }
        @default {
          default
        }
      }
    </div>
  `,
  standalone: true,
  imports: [TestPipe]
})
export class MyApp {
  message = 'hello';
  value = () => 1;
}
