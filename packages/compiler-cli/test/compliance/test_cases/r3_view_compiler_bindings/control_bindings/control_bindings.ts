import {Component, Directive, input} from '@angular/core';

@Directive({selector: '[control]'})
export class Control {
  readonly control = input<string>();
}

@Component({
  template: `
    <input [control]="value">
  `,
  imports: [Control],
})
export class MyComponent {
  value = 'Hello, world!';
}
