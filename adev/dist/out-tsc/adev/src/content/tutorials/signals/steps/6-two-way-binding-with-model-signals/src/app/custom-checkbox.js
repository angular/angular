import {__esDecorate, __runInitializers} from 'tslib';
import {Component, ChangeDetectionStrategy} from '@angular/core';
// TODO: Import model and input from @angular/core
let CustomCheckbox = (() => {
  let _classDecorators = [
    Component({
      selector: 'custom-checkbox',
      template: `
    <label class="custom-checkbox">
      <!-- TODO: Add checkbox input with [checked] binding and (change) event -->
      <span class="checkmark"></span>
      <!-- TODO: Display label -->
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
  };
  return (CustomCheckbox = _classThis);
})();
export {CustomCheckbox};
//# sourceMappingURL=custom-checkbox.js.map
