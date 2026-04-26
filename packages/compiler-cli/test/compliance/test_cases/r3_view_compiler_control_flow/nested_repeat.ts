import {Component} from '@angular/core';

@Component({
    template: `
    @repeat (rows; let row = $index) {
      @repeat (cols; let col = $index) {
        {{row}}:{{col}}
      }
    }
  `,
    standalone: false
})
export class MyApp {
  rows = 2;
  cols = 3;
}
