import {Component} from '@angular/core';

@Component({
  template: `
    @let value = 123;
    {{value}}
    <ng-template>{{value}}</ng-template>
  `,
  standalone: true,
})
export class MyApp {}
