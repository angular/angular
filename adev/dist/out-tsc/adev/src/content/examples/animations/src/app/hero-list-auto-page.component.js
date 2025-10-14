import {__esDecorate, __runInitializers} from 'tslib';
import {Component} from '@angular/core';
import {HEROES} from './mock-heroes';
import {HeroListAutoComponent} from './hero-list-auto.component';
let HeroListAutoCalcPageComponent = (() => {
  let _classDecorators = [
    Component({
      selector: 'app-hero-list-auto-page',
      template: `
    <section>
      <h2>Automatic Calculation</h2>

      <app-hero-list-auto [heroes]="heroes" (remove)="onRemove($event)"></app-hero-list-auto>
    </section>
  `,
      imports: [HeroListAutoComponent],
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var HeroListAutoCalcPageComponent = class {
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
      HeroListAutoCalcPageComponent = _classThis = _classDescriptor.value;
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
  return (HeroListAutoCalcPageComponent = _classThis);
})();
export {HeroListAutoCalcPageComponent};
//# sourceMappingURL=hero-list-auto-page.component.js.map
