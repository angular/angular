import {Component, Directive} from '@angular/core';

@Directive({selector: '[myDir]'})
class MyDir {}

@Component({
  template: `
    <input myDir [attr.aria-disabled]="disabled" [aria-readonly]="readonly" [ariaLabel]="label">
  `,
  imports: [MyDir],
})
export class MyComponent {
  disabled = '';
  readonly = '';
  label = '';
}
