import {Component} from '@angular/core';

@Component({
  template: `
    @for (item of items; track item) {
      <div foo="1" bar="2">{{item}}</div>
    } @empty {
      <span empty-foo="1" empty-bar="2">Empty!</span>
    }
  `,
})
export class MyApp {
  items = [1, 2, 3];
}
