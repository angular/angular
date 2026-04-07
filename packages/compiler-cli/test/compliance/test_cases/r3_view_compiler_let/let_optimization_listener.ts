import {Component} from '@angular/core';

@Component({
  template: `
    {{value}}
    @let one = value + 1;
    @let two = one + 1;
    @let three = two + 1;
    @let four = three + 1;
    {{value}}
    <button (click)="callback(three)"></button>
  `,
})
export class MyApp {
  value = 0;

  callback(value: number) {
    console.log(value);
  }
}
