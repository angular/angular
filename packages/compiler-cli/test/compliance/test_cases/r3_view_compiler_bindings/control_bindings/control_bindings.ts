import {Component, Directive, input} from '@angular/core';

@Directive({selector: '[field]'})
export class Field {
  readonly field = input<string>();
}

@Component({
  template: `
    <div field="Not a form control"></div>
    <div [attr.field]="value">Not a form control either.</div>
    <input [field]="value">
  `,
  imports: [Field],
})
export class MyComponent {
  value = 'Hello, world!';
}
