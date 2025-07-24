import {Component} from '@angular/core';

@Component({
    template: `
    @for (outer of items; track outer; let outerOdd = $odd, outerEven = $even, outerFirst = $first, outerLast = $last) {
      Outer vars: {{outerOdd}} {{outerEven}} {{outerFirst}} {{outerLast}}
      @for (inner of items; track inner; let innerOdd = $odd, innerEven = $even, innerFirst = $first, innerLast = $last) {
        Inner vars: {{innerOdd}} {{innerEven}} {{innerFirst}} {{innerLast}}
        <br>
        Outer vars: {{outerOdd}} {{outerEven}} {{outerFirst}} {{outerLast}}
        @for (innermost of items; track innermost; let innermostOdd = $odd, innermostEven = $even, innermostFirst = $first, innermostLast = $last) {
          Innermost vars: {{innermostOdd}} {{innermostEven}} {{innermostFirst}} {{innermostLast}}
          <br>
          Inner vars: {{innerOdd}} {{innerEven}} {{innerFirst}} {{innerLast}}
          <br>
          Outer vars: {{outerOdd}} {{outerEven}} {{outerFirst}} {{outerLast}}
        }
      }
    }
  `,
    standalone: false
})
export class MyApp {
  items = [];
}
