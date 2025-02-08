import {Component} from '@angular/core';

@Component({
  template: `
    @let one = value + 1;
    @let two = one + 1;

    <button (click)="callback(one, two)"></button>
  `,
})
export class MyApp {
  value = 1;

  callback(one: number, two: number) {
    console.log(one, two);
  }
}
