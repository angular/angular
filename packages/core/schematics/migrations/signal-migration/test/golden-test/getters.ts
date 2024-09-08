// tslint:disable

import {Directive, Input} from '@angular/core';

@Directive({
  standalone: false,
})
export class WithGetters {
  @Input()
  get disabled() {
    return this._disabled;
  }
  set disabled(value: boolean | string) {
    this._disabled = typeof value === 'string' ? value === '' : !!value;
  }

  private _disabled: boolean = false;

  bla() {
    console.log(this._disabled);
  }
}
