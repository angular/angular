import {Component} from '@angular/core';

@Component({
  template: `
    <div i18n>Hello {{value}}</div>
    @let result = value * 2;
    <ng-template>The result is {{result}}</ng-template>
  `,
})
export class MyApp {
  value = 1;
}
