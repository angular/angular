import {Component, Directive, Input} from '@angular/core';

@Directive({selector: '[binding]'})
export class Binding {
  @Input() binding = 0;
}

@Component({
  template: `
    @switch (expr) {
      @case (0) {
        <ng-template foo="1" bar="2" [binding]="3">{{expr}}</ng-template>
      }
      @case (1) {
        <ng-template foo="4" bar="5" [binding]="6">{{expr}}</ng-template>
      }
      @default {
        <ng-template foo="7" bar="8" [binding]="9">{{expr}}</ng-template>
      }
    }
  `,
  imports: [Binding],
})
export class MyApp {
  expr = 0;
}
