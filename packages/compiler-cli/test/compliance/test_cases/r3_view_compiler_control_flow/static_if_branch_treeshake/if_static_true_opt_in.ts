import {Component} from '@angular/core';

@Component({
  template: `
    @if (true) {
      <p>Hello</p>
    } @else {
      <p>world</p>
    }
  `,
  standalone: false,
})
export class MyApp {}
