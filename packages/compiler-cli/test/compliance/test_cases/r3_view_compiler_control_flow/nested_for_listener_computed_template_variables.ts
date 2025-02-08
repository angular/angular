import {Component} from '@angular/core';

@Component({
    template: `
    @for (outer of items; track outer; let outerOdd = $odd, outerEven = $even, outerFirst = $first, outerLast = $last) {
      <button (click)="outerCb(outerOdd, outerEven, outerFirst, outerLast)"></button>

      @for (inner of items; track inner; let innerOdd = $odd, innerEven = $even, innerFirst = $first, innerLast = $last) {
        <button (click)="innerCb(innerOdd, innerEven, innerFirst, innerLast)"></button>
        <button (click)="outerCb(outerOdd, outerEven, outerFirst, outerLast)"></button>

        @for (innermost of items; track innermost; let innermostOdd = $odd, innermostEven = $even, innermostFirst = $first, innermostLast = $last) {
          <button (click)="innermostCb(innermostOdd, innermostEven, innermostFirst, innermostLast)"></button>
          <button (click)="innerCb(innerOdd, innerEven, innerFirst, innerLast)"></button>
          <button (click)="outerCb(outerOdd, outerEven, outerFirst, outerLast)"></button>
        }
      }
    }
  `,
    standalone: false
})
export class MyApp {
  items = [];

  outerCb(...args: unknown[]) {}
  innerCb(...args: unknown[]) {}
  innermostCb(...args: unknown[]) {}
}
