import {__esDecorate, __runInitializers} from 'tslib';
import {Component} from '@angular/core';
import {HeroListComponent} from './hero-list.component';
/**
 * A version of `HeroesComponent` that does not provide the `HeroService` (and thus relies on its
 * `Injectable`-declared provider) in order to function.
 *
 * TSP stands for Tree-Shakeable Provider.
 */
let HeroesTspComponent = (() => {
  let _classDecorators = [
    Component({
      selector: 'app-heroes-tsp',
      template: `
    <h2>Heroes</h2>
    <app-hero-list></app-hero-list>
  `,
      imports: [HeroListComponent],
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var HeroesTspComponent = class {
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
      HeroesTspComponent = _classThis = _classDescriptor.value;
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
  return (HeroesTspComponent = _classThis);
})();
export {HeroesTspComponent};
//# sourceMappingURL=heroes-tsp.component.js.map
