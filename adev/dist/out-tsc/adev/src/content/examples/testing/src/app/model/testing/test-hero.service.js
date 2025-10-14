import {__esDecorate, __runInitializers} from 'tslib';
import {Injectable} from '@angular/core';
import {asyncData} from '../../../testing';
import {map} from 'rxjs/operators';
export {HeroService} from '../hero.service';
export {getTestHeroes} from './test-heroes';
import {HeroService} from '../hero.service';
import {getTestHeroes} from './test-heroes';
let TestHeroService = (() => {
  let _classDecorators = [Injectable()];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  let _classSuper = HeroService;
  var TestHeroService = class extends _classSuper {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata
          ? Object.create(_classSuper[Symbol.metadata] ?? null)
          : void 0;
      __esDecorate(
        null,
        (_classDescriptor = {value: _classThis}),
        _classDecorators,
        {kind: 'class', name: _classThis.name, metadata: _metadata},
        null,
        _classExtraInitializers,
      );
      TestHeroService = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    constructor() {
      // This is a fake testing service that won't be making HTTP
      // requests so we can pass in `null` as the HTTP client.
      super(null);
    }
    heroes = getTestHeroes();
    lastResult; // result from last method call
    addHero(hero) {
      throw new Error('Method not implemented.');
    }
    deleteHero(hero) {
      throw new Error('Method not implemented.');
    }
    getHeroes() {
      return (this.lastResult = asyncData(this.heroes));
    }
    getHero(id) {
      if (typeof id === 'string') {
        id = parseInt(id, 10);
      }
      const hero = this.heroes.find((h) => h.id === id);
      this.lastResult = asyncData(hero);
      return this.lastResult;
    }
    updateHero(hero) {
      return (this.lastResult = this.getHero(hero.id).pipe(
        map((h) => {
          if (h) {
            return Object.assign(h, hero);
          }
          throw new Error(`Hero ${hero.id} not found`);
        }),
      ));
    }
  };
  return (TestHeroService = _classThis);
})();
export {TestHeroService};
//# sourceMappingURL=test-hero.service.js.map
