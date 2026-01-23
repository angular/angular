import { Component, Directive, input } from '@angular/core';

@Directive({selector: '[formField]'})
export class FormField {
  readonly formField = input<string>();
}

@Component({
  template: `
    <div formField="Not a form control"></div>
    <div [attr.formField]="value">Not a form control either.</div>
    <input [formField]="value">
  `,
  imports: [FormField],
})
export class MyComponent {
  value = 'Hello, world!';
}
