import {__esDecorate, __runInitializers} from 'tslib';
import {Component} from '@angular/core';
import {AsyncPipe} from '@angular/common';
import {sharedImports} from '../shared/shared';
let HeroListComponent = (() => {
  let _classDecorators = [
    Component({
      selector: 'app-heroes',
      templateUrl: './hero-list.component.html',
      styleUrls: ['./hero-list.component.css'],
      imports: [AsyncPipe, sharedImports],
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var HeroListComponent = class {
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
      HeroListComponent = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    router;
    heroService;
    heroes;
    selectedHero;
    constructor(router, heroService) {
      this.router = router;
      this.heroService = heroService;
      this.heroes = this.heroService.getHeroes();
    }
    onSelect(hero) {
      this.selectedHero = hero;
      this.router.navigate(['../heroes', this.selectedHero.id]);
    }
  };
  return (HeroListComponent = _classThis);
})();
export {HeroListComponent};
//# sourceMappingURL=hero-list.component.js.map
