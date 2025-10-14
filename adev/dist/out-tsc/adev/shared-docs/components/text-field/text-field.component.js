/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__esDecorate, __runInitializers} from 'tslib';
import {
  ChangeDetectionStrategy,
  Component,
  input,
  afterNextRender,
  forwardRef,
  signal,
  model,
  viewChild,
} from '@angular/core';
import {FormsModule, NG_VALUE_ACCESSOR} from '@angular/forms';
import {IconComponent} from '../icon/icon.component';
let TextField = (() => {
  let _classDecorators = [
    Component({
      selector: 'docs-text-field',
      changeDetection: ChangeDetectionStrategy.OnPush,
      imports: [FormsModule, IconComponent],
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
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var TextField = class {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata ? Object.create(null) : void 0;
      __esDecorate(
        null,
        (_classDescriptor = {value: _classThis}),
        _classDecorators,
        {kind: 'class', name: _classThis.name, metadata: _metadata},
        null,
        _classExtraInitializers,
      );
      TextField = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    input = viewChild.required('inputRef');
    name = input(null);
    placeholder = input(null);
    disabled = model(false);
    hideIcon = input(false);
    autofocus = input(false);
    resetLabel = input(null);
    // Implemented as part of ControlValueAccessor.
    onChange = (_) => {};
    onTouched = () => {};
    value = signal(null);
    constructor() {
      afterNextRender(() => {
        if (this.autofocus()) {
          this.input().nativeElement.focus();
        }
      });
    }
    // Implemented as part of ControlValueAccessor.
    writeValue(value) {
      this.value.set(typeof value === 'string' ? value : null);
    }
    // Implemented as part of ControlValueAccessor.
    registerOnChange(fn) {
      this.onChange = fn;
    }
    // Implemented as part of ControlValueAccessor.
    registerOnTouched(fn) {
      this.onTouched = fn;
    }
    // Implemented as part of ControlValueAccessor.
    setDisabledState(isDisabled) {
      this.disabled.set(isDisabled);
    }
    setValue(value) {
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
  };
  return (TextField = _classThis);
})();
export {TextField};
//# sourceMappingURL=text-field.component.js.map
