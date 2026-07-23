import {Component} from '@angular/core';

@Component({
  template: `
    <input [attr.aria-disabled]="disabled" [aria-readonly]="readonly" [ariaLabel]="label">
  `,
})
export class MyComponent {
  disabled = '';
  readonly = '';
  label = '';
}
