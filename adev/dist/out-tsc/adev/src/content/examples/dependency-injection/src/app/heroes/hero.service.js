import {__esDecorate, __runInitializers} from 'tslib';
// #docregion
import {Injectable} from '@angular/core';
import {HEROES} from './mock-heroes';
import {Logger} from '../logger.service';
import {UserService} from '../user.service';
let HeroService = (() => {
  let _classDecorators = [
    Injectable({
      providedIn: 'root',
      useFactory: (logger, userService) => new HeroService(logger, userService.user.isAuthorized),
      deps: [Logger, UserService],
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
    logger;
    isAuthorized;
    // #docregion internals
    constructor(logger, isAuthorized) {
      this.logger = logger;
      this.isAuthorized = isAuthorized;
    }
    getHeroes() {
      const auth = this.isAuthorized ? 'authorized' : 'unauthorized';
      this.logger.log(`Getting heroes for ${auth} user.`);
      return HEROES.filter((hero) => this.isAuthorized || !hero.isSecret);
    }
  };
  return (HeroService = _classThis);
})();
export {HeroService};
//# sourceMappingURL=hero.service.js.map
