import {__esDecorate, __runInitializers} from 'tslib';
// #docregion
import {Component} from '@angular/core';
import {heroServiceProvider} from './hero.service.provider';
import {HeroListComponent} from './hero-list.component';
let HeroesComponent = (() => {
  let _classDecorators = [
    Component({
      selector: 'app-heroes',
      providers: [heroServiceProvider],
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
  var HeroesComponent = class {
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
      HeroesComponent = _classThis = _classDescriptor.value;
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
  return (HeroesComponent = _classThis);
})();
export {HeroesComponent};
//# sourceMappingURL=heroes.component.js.map
