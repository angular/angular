import {Component} from '@angular/core';

@Component({
  template: `
    @let a = 1;

    @if (true) {
      @let b = 2;

      @if (true) {
        @let c = 3;
        {{(() => a + b + c)()}}
      }
    }
  `
})
export class TestComp {}
