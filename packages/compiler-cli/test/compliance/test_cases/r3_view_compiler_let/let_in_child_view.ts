import {Component} from '@angular/core';

@Component({
  template: `
    @if (true) {
      @if (true) {
        @let three = two + 1;
        {{three}}
      }
      @let two = one + 1;
    }

    @let one = 1;
  `,
})
export class MyApp {}
