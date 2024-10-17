import {Component} from '@angular/core';

@Component({
  template: `
    {{value}}
    @let one = value + 1;
    @let two = one + 1;
    @let three = two + 1;
    @let four = three + 1;
    {{two}}
  `,
})
export class MyApp {
  value = 0;
}
