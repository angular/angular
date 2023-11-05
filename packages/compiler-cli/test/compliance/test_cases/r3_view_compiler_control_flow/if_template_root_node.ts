import {Component} from '@angular/core';

@Component({
  template: `
    @if (expr) {
      <ng-template foo="1" bar="2">{{expr}}</ng-template>
    }
  `,
})
export class MyApp {
  expr = true;
}
