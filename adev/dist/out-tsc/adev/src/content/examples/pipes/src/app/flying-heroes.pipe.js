import {__esDecorate, __runInitializers} from 'tslib';
// #docregion
// #docregion pure
import {Pipe} from '@angular/core';
let FlyingHeroesPipe = (() => {
  let _classDecorators = [
    Pipe({
      name: 'flyingHeroes',
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var FlyingHeroesPipe = class {
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
      FlyingHeroesPipe = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    transform(allHeroes) {
      // #docregion filter
      return allHeroes.filter((hero) => hero.canFly);
      // #enddocregion filter
    }
  };
  return (FlyingHeroesPipe = _classThis);
})();
export {FlyingHeroesPipe};
// #enddocregion pure
/////// Identical except for the pure flag
// #docregion impure
// #docregion pipe-decorator
let FlyingHeroesImpurePipe = (() => {
  let _classDecorators = [
    Pipe({
      name: 'flyingHeroesImpure',
      pure: false,
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  let _classSuper = FlyingHeroesPipe;
  var FlyingHeroesImpurePipe = class extends _classSuper {
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
      FlyingHeroesImpurePipe = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
  };
  return (FlyingHeroesImpurePipe = _classThis);
})();
export {FlyingHeroesImpurePipe};
// #enddocregion impure
//# sourceMappingURL=flying-heroes.pipe.js.map
