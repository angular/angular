import {__esDecorate, __runInitializers} from 'tslib';
// #docregion
import {Injectable} from '@angular/core';
import {HEROES} from './mock-heroes';
let HeroService = (() => {
  let _classDecorators = [
    Injectable({
      // declares that this service should be created
      // by the root application injector.
      providedIn: 'root',
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var HeroService = class {
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
      HeroService = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    getHeroes() {
      return HEROES;
    }
  };
  return (HeroService = _classThis);
})();
export {HeroService};
//# sourceMappingURL=hero.service.3.js.map
