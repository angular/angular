import {__esDecorate, __runInitializers} from 'tslib';
// #docplaster
import {Component, signal} from '@angular/core';
let OpenCloseComponent = (() => {
  let _classDecorators = [
    Component({
      selector: 'app-open-close',
      templateUrl: 'open-close.component.html',
      styleUrls: ['open-close.component.css'],
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var OpenCloseComponent = class {
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
      OpenCloseComponent = _classThis = _classDescriptor.value;
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
  return (OpenCloseComponent = _classThis);
})();
export {OpenCloseComponent};
//# sourceMappingURL=open-close.component.js.map
