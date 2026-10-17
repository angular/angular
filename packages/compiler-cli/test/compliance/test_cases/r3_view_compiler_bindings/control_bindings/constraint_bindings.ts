import {Component, Directive, input, model, signal} from '@angular/core';

@Directive({selector: '[formField]'})
export class FormField {
  readonly formField = input<string>();
}

@Component({selector: 'range-control', template: ''})
export class RangeControl {
  readonly min = input<number | string>(0);
  readonly max = model(100);
  readonly minLength = input('');
  readonly maxLength = input(0);
}

@Component({
  template: `
    <range-control [formField]="field" [min]="minimum" [(max)]="maximum"
      minLength="{{length}}" bind-maxLength="length" />
    <range-control [formField]="field" min="0" [attr.max]="10" />
  `,
  imports: [FormField, RangeControl],
})
export class MyComponent {
  field = 'field';
  minimum = 0;
  maximum = signal(100);
  length = 5;
}
