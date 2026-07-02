import {Component} from '@angular/core';

// We verify the data slots by defining templates before/after
// and checking that the indexes are sequential.
@Component({
    template: `
    <ng-template/>
    @for (item of items; track item) {
      {{item}}
    } @empty {
      Empty
    }
    <ng-template/>
  `,
    standalone: false
})
export class MyApp {
  items = ['one', 'two', 'three'];
}
