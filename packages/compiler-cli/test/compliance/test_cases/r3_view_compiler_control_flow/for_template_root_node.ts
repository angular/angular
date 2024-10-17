import {Component, Directive, Input} from '@angular/core';

@Directive({selector: '[binding]'})
export class Binding {
  @Input() binding = 0;
}

@Component({
  template: `
    @for (item of items; track item) {
      <ng-template foo="1" bar="2" [binding]="3">{{item}}</ng-template>
    } @empty {
      <ng-template empty-foo="1" empty-bar="2" [binding]="3">Empty!</ng-template>
    }
  `,
  imports: [Binding],
})
export class MyApp {
  items = [1, 2, 3];
}
