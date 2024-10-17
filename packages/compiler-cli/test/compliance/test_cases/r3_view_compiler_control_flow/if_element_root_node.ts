import {Component, Directive, Input} from '@angular/core';

@Directive({selector: '[binding]'})
export class Binding {
  @Input() binding = 0;
}

@Component({
  template: `
    @if (expr === 0) {
      <div foo="1" bar="2" [binding]="3">{{expr}}</div>
    } @else if (expr === 1) {
      <div foo="4" bar="5" [binding]="6">{{expr}}</div>
    } @else {
      <div foo="7" bar="8" [binding]="9">{{expr}}</div>
    }
  `,
  imports: [Binding],
})
export class MyApp {
  expr = 0;
}
