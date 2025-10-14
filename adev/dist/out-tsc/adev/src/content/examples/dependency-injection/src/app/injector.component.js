import {__esDecorate, __runInitializers} from 'tslib';
// #docplaster
// #docregion
import {Component, inject, Injector} from '@angular/core';
import {Car, Engine, Tires} from './car/car';
import {HeroService} from './heroes/hero.service';
import {heroServiceProvider} from './heroes/hero.service.provider';
import {Logger} from './logger.service';
let InjectorComponent = (() => {
  let _classDecorators = [
    Component({
      selector: 'app-injectors',
      template: `
  <h2>Other Injections</h2>
  <div id="car">{{car.drive()}}</div>
  <div id="hero">{{hero.name}}</div>
  <div id="rodent">{{rodent}}</div>
  `,
      providers: [Car, Engine, Tires, heroServiceProvider, Logger],
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var InjectorComponent = class {
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
      InjectorComponent = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    car;
    heroService;
    hero;
    injector = inject(Injector);
    constructor() {
      this.car = this.injector.get(Car);
      this.heroService = this.injector.get(HeroService);
      this.hero = this.heroService.getHeroes()[0];
    }
    get rodent() {
      const rousDontExist = "R.O.U.S.'s? I don't think they exist!";
      return this.injector.get(ROUS, rousDontExist);
    }
  };
  return (InjectorComponent = _classThis);
})();
export {InjectorComponent};
/**
 * R.O.U.S. - Rodents Of Unusual Size
 * // https://www.youtube.com/watch?v=BOv5ZjAOpC8
 */
class ROUS {}
//# sourceMappingURL=injector.component.js.map
