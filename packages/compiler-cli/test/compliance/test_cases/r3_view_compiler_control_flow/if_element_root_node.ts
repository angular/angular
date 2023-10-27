import {Component} from '@angular/core';

@Component({
  template: `
    @if (expr) {
      <div foo="1" bar="2">{{expr}}</div>
    }
  `,
})
export class MyApp {
  expr = true;
}
