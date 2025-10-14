import {__esDecorate, __runInitializers} from 'tslib';
import {Injectable} from '@angular/core';
let CarService = (() => {
  let _classDecorators = [
    Injectable({
      providedIn: 'root',
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var CarService = class {
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
      CarService = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    cars = ['Sunflower GT', 'Flexus Sport', 'Sprout Mach One'];
    getCars() {
      return this.cars;
    }
    getCar(id) {
      return this.cars[id];
    }
  };
  return (CarService = _classThis);
})();
export {CarService};
//# sourceMappingURL=car.service.js.map
