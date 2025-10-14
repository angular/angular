/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__esDecorate, __runInitializers} from 'tslib';
import {ChangeDetectionStrategy, Component, forwardRef, model, input, signal} from '@angular/core';
import {NG_VALUE_ACCESSOR} from '@angular/forms';
let SlideToggle = (() => {
  let _classDecorators = [
    Component({
      selector: 'docs-slide-toggle',
      imports: [],
      changeDetection: ChangeDetectionStrategy.OnPush,
      templateUrl: './slide-toggle.component.html',
      styleUrls: ['./slide-toggle.component.scss'],
      providers: [
        {
          provide: NG_VALUE_ACCESSOR,
          useExisting: forwardRef(() => SlideToggle),
          multi: true,
        },
      ],
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var SlideToggle = class {
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
      SlideToggle = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    buttonId = input.required();
    label = input.required();
    disabled = model(false);
    // Implemented as part of ControlValueAccessor.
    onChange = (_) => {};
    onTouched = () => {};
    checked = signal(false);
    // Implemented as part of ControlValueAccessor.
    writeValue(value) {
      this.checked.set(value);
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
    // Toggles the checked state of the slide-toggle.
    toggle() {
      if (this.disabled()) {
        return;
      }
      this.checked.update((checked) => !checked);
      this.onChange(this.checked());
      this.onTouched();
    }
  };
  return (SlideToggle = _classThis);
})();
export {SlideToggle};
//# sourceMappingURL=slide-toggle.component.js.map
