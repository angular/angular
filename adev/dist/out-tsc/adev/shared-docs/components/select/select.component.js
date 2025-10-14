/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__esDecorate, __runInitializers} from 'tslib';
import {NG_VALUE_ACCESSOR, FormsModule} from '@angular/forms';
import {ChangeDetectionStrategy, Component, model, forwardRef, input, signal} from '@angular/core';
let Select = (() => {
  let _classDecorators = [
    Component({
      selector: 'docs-select',
      changeDetection: ChangeDetectionStrategy.OnPush,
      imports: [FormsModule],
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
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var Select = class {
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
      Select = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    id = input.required({alias: 'selectId'});
    name = input.required();
    options = input.required();
    disabled = model(false);
    // Implemented as part of ControlValueAccessor.
    onChange = (_) => {};
    onTouched = () => {};
    selectedOption = signal(null);
    // Implemented as part of ControlValueAccessor.
    writeValue(value) {
      this.selectedOption.set(value);
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
    setOption($event) {
      if (this.disabled()) {
        return;
      }
      this.selectedOption.set($event);
      this.onChange($event);
      this.onTouched();
    }
  };
  return (Select = _classThis);
})();
export {Select};
//# sourceMappingURL=select.component.js.map
