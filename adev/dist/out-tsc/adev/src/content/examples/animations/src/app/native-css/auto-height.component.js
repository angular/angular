import {__esDecorate, __runInitializers} from 'tslib';
// #docplaster
import {Component, signal} from '@angular/core';
let AutoHeightComponent = (() => {
  let _classDecorators = [
    Component({
      selector: 'app-auto-height',
      templateUrl: 'auto-height.component.html',
      styleUrls: ['auto-height.component.css'],
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var AutoHeightComponent = class {
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
      AutoHeightComponent = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    isOpen = signal(true);
    toggle() {
      this.isOpen.update((isOpen) => !isOpen);
    }
  };
  return (AutoHeightComponent = _classThis);
})();
export {AutoHeightComponent};
//# sourceMappingURL=auto-height.component.js.map
