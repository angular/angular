import {Component} from '@angular/core';

@Component({
  template: `
    @let value = 123;
    {{value}}
    <ng-template>{{value}}</ng-template>
  `,
})
export class MyApp {}
