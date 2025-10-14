import {__esDecorate, __runInitializers} from 'tslib';
import {Component} from '@angular/core';
import {HEROES} from './mock-heroes';
import {HeroListGroupsComponent} from './hero-list-groups.component';
let HeroListGroupPageComponent = (() => {
  let _classDecorators = [
    Component({
      selector: 'app-hero-list-groups-page',
      template: `
    <section>
      <h2>Hero List Group</h2>

      <app-hero-list-groups [heroes]="heroes" (remove)="onRemove($event)"></app-hero-list-groups>
    </section>
  `,
      imports: [HeroListGroupsComponent],
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var HeroListGroupPageComponent = class {
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
      HeroListGroupPageComponent = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    heroes = HEROES.slice();
    onRemove(id) {
      this.heroes = this.heroes.filter((hero) => hero.id !== id);
    }
  };
  return (HeroListGroupPageComponent = _classThis);
})();
export {HeroListGroupPageComponent};
//# sourceMappingURL=hero-list-group-page.component.js.map
