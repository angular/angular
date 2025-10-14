import {__esDecorate, __runInitializers} from 'tslib';
import {Injectable} from '@angular/core';
export class Engine {
  cylinders = 4;
}
export class Tires {
  make = 'Flintstone';
  model = 'Square';
}
let Car = (() => {
  let _classDecorators = [Injectable()];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var Car = class {
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
      Car = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    engine;
    tires;
    description = 'DI';
    constructor(engine, tires) {
      this.engine = engine;
      this.tires = tires;
    }
    // Method using the engine and tires
    drive() {
      return (
        `${this.description} car with ` +
        `${this.engine.cylinders} cylinders and ${this.tires.make} tires.`
      );
    }
  };
  return (Car = _classThis);
})();
export {Car};
//# sourceMappingURL=car.js.map
