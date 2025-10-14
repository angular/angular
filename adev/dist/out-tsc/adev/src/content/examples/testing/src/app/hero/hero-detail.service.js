import {__esDecorate, __runInitializers} from 'tslib';
import {inject, Injectable} from '@angular/core';
import {map} from 'rxjs/operators';
import {HeroService} from '../model/hero.service';
// #docregion prototype
let HeroDetailService = (() => {
  let _classDecorators = [Injectable({providedIn: 'root'})];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var HeroDetailService = class {
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
      HeroDetailService = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    heroService = inject(HeroService);
    // #enddocregion prototype
    // Returns a clone which caller may modify safely
    getHero(id) {
      if (typeof id === 'string') {
        id = parseInt(id, 10);
      }
      return this.heroService
        .getHero(id)
        .pipe(map((hero) => (hero ? Object.assign({}, hero) : null)));
    }
    saveHero(hero) {
      return this.heroService.updateHero(hero);
    }
  };
  return (HeroDetailService = _classThis);
})();
export {HeroDetailService};
// #enddocregion prototype
//# sourceMappingURL=hero-detail.service.js.map
