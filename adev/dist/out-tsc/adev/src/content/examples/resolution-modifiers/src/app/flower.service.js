import {__esDecorate, __runInitializers} from 'tslib';
import {Injectable} from '@angular/core';
let FlowerService = (() => {
  let _classDecorators = [
    Injectable({
      providedIn: 'root', // provide this service in the root ModuleInjector
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var FlowerService = class {
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
      FlowerService = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    emoji = '🌸';
  };
  return (FlowerService = _classThis);
})();
export {FlowerService};
//# sourceMappingURL=flower.service.js.map
