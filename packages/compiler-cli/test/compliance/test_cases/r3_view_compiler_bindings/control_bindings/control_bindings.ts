import {Component, Directive, input} from '@angular/core';

@Directive({selector: '[control]'})
export class Control {
  readonly control = input<string>();
}

@Component({
  template: `
    <div control="Not a form control"></div>
    <div [attr.control]="value">Not a form control either.</div>
    <input [control]="value">
  `,
  imports: [Control],
})
export class MyComponent {
  value = 'Hello, world!';
}
