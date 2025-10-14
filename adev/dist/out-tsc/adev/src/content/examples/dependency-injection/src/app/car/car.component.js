import {__esDecorate, __runInitializers} from 'tslib';
// #docregion
import {Component, inject} from '@angular/core';
import {Car, Engine, Tires} from './car';
import {Car as CarNoDi} from './car-no-di';
import {CarFactory} from './car-factory';
import {testCar, simpleCar, superCar} from './car-creations';
import {useInjector} from './car-injector';
let CarComponent = (() => {
  let _classDecorators = [
    Component({
      selector: 'app-car',
      template: `
  <h2>Cars</h2>
  <div id="di">{{car.drive()}}</div>
  <div id="nodi">{{noDiCar.drive()}}</div>
  <div id="injector">{{injectorCar.drive()}}</div>
  <div id="factory">{{factoryCar.drive()}}</div>
  <div id="simple">{{simpleCar.drive()}}</div>
  <div id="super">{{superCar.drive()}}</div>
  <div id="test">{{testCar.drive()}}</div>
  `,
      providers: [Car, Engine, Tires],
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var CarComponent = class {
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
      CarComponent = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    factoryCar = new CarFactory().createCar();
    injectorCar = useInjector();
    noDiCar = new CarNoDi();
    simpleCar = simpleCar();
    superCar = superCar();
    testCar = testCar();
    car = inject(Car);
  };
  return (CarComponent = _classThis);
})();
export {CarComponent};
//# sourceMappingURL=car.component.js.map
