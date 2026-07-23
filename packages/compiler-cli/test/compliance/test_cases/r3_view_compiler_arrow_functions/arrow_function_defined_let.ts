import {Component} from '@angular/core';

@Component({
  template: `
    @let fn = (a, b) => componentValue + a + b;
    One: {{fn(0, 1)}}

    @if (true) {
      Two: {{fn(1, 1)}}

      <button (click)="componentValue = fn(2, 1)"></button>
    }
  `
})
export class TestComp {
  componentValue = 0;
}
