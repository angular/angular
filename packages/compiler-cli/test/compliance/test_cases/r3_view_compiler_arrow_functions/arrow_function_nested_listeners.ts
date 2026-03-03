import {Component, signal} from '@angular/core';

@Component({
  template: `
    @let a = 1;

    @if (true) {
      <input #b>

      @if (true) {
        @let c = 3;

        <button (click)="someSignal((prev) => prev + a + b.value + c + componentProp)"></button>
      }
    }
  `
})
export class TestComp {
  someSignal = signal('');
  componentProp = 0;
}
