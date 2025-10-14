import {__esDecorate, __runInitializers} from 'tslib';
// #docplaster
import {Component, signal} from '@angular/core';
let RemoveComponent = (() => {
  let _classDecorators = [
    Component({
      selector: 'app-remove',
      templateUrl: 'remove.component.html',
      styleUrls: ['remove.component.css'],
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var RemoveComponent = class {
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
      RemoveComponent = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    isShown = signal(false);
    toggle() {
      this.isShown.update((isShown) => !isShown);
    }
  };
  return (RemoveComponent = _classThis);
})();
export {RemoveComponent};
//# sourceMappingURL=remove.component.js.map
