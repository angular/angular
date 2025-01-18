import {Component} from '@angular/core';

@Component({
    template: `
    <div>
      {{message}}
      @switch (value()) {
        @case (0; 1; 2) {
          case 0, 1, or 2
        }
        @case (3) {
          case 3
        }
        @case (4) {
          case 4
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
