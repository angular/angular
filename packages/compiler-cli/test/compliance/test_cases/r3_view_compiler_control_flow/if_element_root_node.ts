import {Component, Directive, Input} from '@angular/core';

@Directive({standalone: true, selector: '[binding]'})
export class Binding {
  @Input() binding = 0;
}

@Component({
  template: `
    @if (expr) {
      <div foo="1" bar="2" [binding]="3">{{expr}}</div>
    }
  `,
  standalone: true,
  imports: [Binding],
})
export class MyApp {
  expr = true;
}
