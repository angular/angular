import {__esDecorate, __runInitializers} from 'tslib';
// #docregion
import {Component} from '@angular/core';
let HeroListComponent = (() => {
  let _classDecorators = [
    Component({
      selector: 'app-hero-list',
      template: `
    @for (hero of heroes; track hero) {
      <div>
        {{hero.id}} - {{hero.name}}
        ({{hero.isSecret ? 'secret' : 'public'}})
      </div>
    }
  `,
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
    heroes;
    // #docregion ctor-signature
    constructor(heroService) {
      this.heroes = heroService.getHeroes();
    }
  };
  return (HeroListComponent = _classThis);
})();
export {HeroListComponent};
//# sourceMappingURL=hero-list.component.js.map
