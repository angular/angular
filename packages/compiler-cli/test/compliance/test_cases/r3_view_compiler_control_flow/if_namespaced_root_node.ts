import {Component} from '@angular/core';

@Component({
  template: `
    @if (expr) {
      <svg foo="1"></svg>
    } @else {
      <math foo="2"></math>
    }
  `,
})
export class MyApp {
  expr = true;
}
