import {Component} from '@angular/core';

@Component({
  template: `
    @for (item of items; track item) {
      @let outerFirst = $first;

      @for (subitem of item.children; track subitem) {
        @let innerFirst = $first;

        {{outerFirst || innerFirst}}
      }
    }
  `,
})
export class MyApp {
  items: {children: any[]}[] = [];
}
