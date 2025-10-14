import {__esDecorate, __runInitializers} from 'tslib';
import {Component} from '@angular/core';
import {HEROES} from './mock-heroes';
import {HeroListEnterLeaveComponent} from './hero-list-enter-leave.component';
let HeroListEnterLeavePageComponent = (() => {
  let _classDecorators = [
    Component({
      selector: 'app-hero-list-enter-leave-page',
      template: `
    <section>
      <h2>Enter/Leave</h2>

      <app-hero-list-enter-leave [heroes]="heroes" (remove)="onRemove($event)"></app-hero-list-enter-leave>
    </section>
  `,
      imports: [HeroListEnterLeaveComponent],
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var HeroListEnterLeavePageComponent = class {
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
      HeroListEnterLeavePageComponent = _classThis = _classDescriptor.value;
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
  return (HeroListEnterLeavePageComponent = _classThis);
})();
export {HeroListEnterLeavePageComponent};
//# sourceMappingURL=hero-list-enter-leave-page.component.js.map
