import {Component} from '@angular/core';

@Component({
  template: `
    <ng-template>
      {{result}}
      @let result = value * 2;
    </ng-template>
  `,
})
export class MyApp {
  value = 1;
}
