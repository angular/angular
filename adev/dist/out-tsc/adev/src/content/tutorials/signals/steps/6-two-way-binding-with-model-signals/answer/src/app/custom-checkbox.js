import {__esDecorate, __runInitializers} from 'tslib';
import {Component, model, input, ChangeDetectionStrategy} from '@angular/core';
let CustomCheckbox = (() => {
  let _classDecorators = [
    Component({
      selector: 'custom-checkbox',
      template: `
    <label class="custom-checkbox">
      <input 
        type="checkbox" 
        [checked]="checked()" 
        (change)="toggle()">
      <span class="checkmark"></span>
      {{ label() }}
    </label>
  `,
      changeDetection: ChangeDetectionStrategy.OnPush,
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var CustomCheckbox = class {
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
      CustomCheckbox = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    // Model signal for two-way binding
    checked = model.required();
    // Optional input for label
    label = input('');
    toggle() {
      // This updates BOTH the component's state AND the parent's model!
      this.checked.set(!this.checked());
    }
  };
  return (CustomCheckbox = _classThis);
})();
export {CustomCheckbox};
//# sourceMappingURL=custom-checkbox.js.map
