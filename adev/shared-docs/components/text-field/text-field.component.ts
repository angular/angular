/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  input,
  afterNextRender,
  forwardRef,
  signal,
  model,
  viewChild,
} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR} from '@angular/forms';
import {IconComponent} from '../icon/icon.component';

@Component({
  selector: 'docs-text-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, IconComponent],
  templateUrl: './text-field.component.html',
  styleUrls: ['./text-field.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TextField),
      multi: true,
    },
  ],
  host: {
    class: 'docs-form-element',
  },
})
export class TextField implements ControlValueAccessor {
  readonly input = viewChild.required<ElementRef<HTMLInputElement>>('inputRef');

  readonly name = input<string | null>(null);
  readonly placeholder = input<string | null>(null);
  readonly disabled = model<boolean>(false);
  readonly hideIcon = input<boolean>(false);
  readonly autofocus = input<boolean>(false);
  readonly resetLabel = input<string | null>(null);

  // Implemented as part of ControlValueAccessor.
  private onChange: (value: string) => void = (_: string) => {};
  private onTouched: () => void = () => {};

  protected readonly value = signal<string | null>(null);

  constructor() {
    afterNextRender(() => {
      if (this.autofocus()) {
        this.input().nativeElement.focus();
      }
    });
  }

  // Implemented as part of ControlValueAccessor.
  writeValue(value: unknown): void {
    this.value.set(typeof value === 'string' ? value : null);
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

  setValue(value: string): void {
    if (this.disabled()) {
      return;
    }

    this.value.set(value);
    this.onChange(value);
    this.onTouched();
  }

  clearTextField() {
    this.setValue('');
  }
}
