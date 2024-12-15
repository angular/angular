import {Directive, inject, output} from '@angular/core';
import {FormFieldControl, NgField} from './ngfield';

// Example implementations of a few controls that work with the `NgField` directive.

@Directive({
  selector: 'input',
  host: {
    '(input)': 'change.emit($event.target.value)',
    '(blur)': 'blur.emit($event)',
  },
})
export class NativeInput implements FormFieldControl<string> {
  ngField: NgField<string> | null = inject(NgField, {optional: true});

  change = output<string>({alias: ''});
  blur = output({alias: ''});

  constructor() {
    this.ngField?.registerControl(this);
  }
}
