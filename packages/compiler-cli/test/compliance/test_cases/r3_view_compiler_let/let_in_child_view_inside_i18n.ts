import {Component} from '@angular/core';

@Component({
  template: `
    <div i18n>
      @let result = value * 2;
      <ng-template>The result is {{result}}</ng-template>
    </div>
  `,
})
export class MyApp {
  value = 1;
}
