import {Directive, input, model, Signal, WritableSignal} from '@angular/core';

interface FieldContract<T> {
  value: WritableSignal<T>;
  touched: Signal<boolean>;
  dirty: Signal<boolean>;
  disabled: Signal<boolean>;
  valid: Signal<boolean>;
  errors: Signal<string[]>;
}

@Directive({
  selector: 'input',
  host: {
    '[value]': 'field() ? field().value() : value()',
    '[disabled]': 'field() ? field().disabled() : disabled()',
    '[class.touched]': 'field() ? field().touched() : touched()',
    '[class.dirty]': 'field() ? field().dirty() : dirty()',
    '[class.valid]': 'field() ? field().valid() : valid()',
    '(input)': 'update($event.target.value)',
  },
})
export class Field implements FieldContract<unknown> {
  field = input<FieldContract<unknown>>();
  value = model();
  touched = input(false);
  dirty = input(false);
  disabled = input(false);
  valid = input(true);
  errors = input<string[]>([]);

  update(v: any) {
    if (this.field()) {
      this.field()?.value.set(v);
    } else {
      this.value.set(v);
    }
  }
}
