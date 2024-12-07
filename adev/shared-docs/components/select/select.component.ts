/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ControlValueAccessor, NG_VALUE_ACCESSOR, FormsModule} from '@angular/forms';
import {ChangeDetectionStrategy, Component, model, forwardRef, input, signal} from '@angular/core';
import {CommonModule} from '@angular/common';

type SelectOptionValue = string | number | boolean;

export interface SelectOption {
  label: string;
  value: SelectOptionValue;
}

@Component({
  selector: 'docs-select',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => Select),
      multi: true,
    },
  ],
  host: {
    class: 'docs-form-element',
  },
})
export class Select implements ControlValueAccessor {
  readonly id = input.required<string>({alias: 'selectId'});
  readonly name = input.required<string>();
  readonly options = input.required<SelectOption[]>();
  readonly disabled = model<boolean>(false);

  // Implemented as part of ControlValueAccessor.
  private onChange: (value: SelectOptionValue) => void = (_: SelectOptionValue) => {};
  private onTouched: () => void = () => {};

  protected readonly selectedOption = signal<SelectOptionValue | null>(null);

  // Implemented as part of ControlValueAccessor.
  writeValue(value: SelectOptionValue): void {
    this.selectedOption.set(value);
  }

  // Implemented as part of ControlValueAccessor.
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  // Implemented as part of ControlValueAccessor.
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  // Implemented as part of ControlValueAccessor.
  setDisabledState?(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  setOption($event: SelectOptionValue): void {
    if (this.disabled()) {
      return;
    }

    this.selectedOption.set($event);
    this.onChange($event);
    this.onTouched();
  }
}
