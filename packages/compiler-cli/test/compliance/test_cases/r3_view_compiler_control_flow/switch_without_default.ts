import {Component} from '@angular/core';

@Component({
    template: `
    <div>
      {{message}}
      @switch (value()) {
        @case (0) {
          case 0
        }
        @case (1) {
          case 1
        }
        @case (2) {
          case 2
        }
      }
    </div>
  `,
    standalone: false
})
export class MyApp {
  message = 'hello';
  value = () => 1;
}
