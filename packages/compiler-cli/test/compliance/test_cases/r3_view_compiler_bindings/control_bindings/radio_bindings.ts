import { Component, Directive, input } from '@angular/core';

@Directive({selector: '[field]'})
export class Field {
  readonly field = input<string>();
}

// Notice that we check that the binding order doesn't matter
@Component({
  template: `
    <input
        type="radio"
        [field]="value"
        [value]="'foo'"
        id="radio"
      />

      <input
        type="radio"
        [value]="'foo'"
        [field]="value"
        id="radio"
      />
  `,
  imports: [Field],
})
export class MyComponent {
  value = 'foo';
  
}
