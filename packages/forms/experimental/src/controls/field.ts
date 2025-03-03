import {Directive, effect, ElementRef, inject, input} from '@angular/core';
import type {Form} from '../api/form';

@Directive({
  selector: '[field]',
})
export class Field<T> {
  readonly field = input.required<Form<T>>();
  readonly el = inject(ElementRef);

  constructor() {
    if (this.el.nativeElement instanceof HTMLInputElement) {
      // Bind our field to an <input>

      const i = this.el.nativeElement;
      const isCheckbox = i.type === 'checkbox';

      i.addEventListener('input', () => {
        this.field().$.value.set((!isCheckbox ? i.value : i.checked) as T);
      });
      i.addEventListener('blur', () => this.field().$.markAsTouched());

      effect(() => {
        if (!isCheckbox) {
          i.value = this.field().$.value() as string;
        } else {
          i.checked = this.field().$.value() as boolean;
        }
      });
    } else {
      throw new Error(`Unhandled control?`);
    }
  }
}
