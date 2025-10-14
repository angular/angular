import {__esDecorate, __runInitializers} from 'tslib';
import {Component, input, output} from '@angular/core';
import {trigger, state, style, animate, transition} from '@angular/animations';
let HeroListEnterLeaveComponent = (() => {
  let _classDecorators = [
    Component({
      selector: 'app-hero-list-enter-leave',
      template: `
    <ul class="heroes">
      @for (hero of heroes(); track hero) {
        <li [@flyInOut]="'in'">
          <button class="inner" type="button" (click)="removeHero(hero.id)">
            <span class="badge">{{ hero.id }}</span>
            <span class="name">{{ hero.name }}</span>
          </button>
        </li>
      }
    </ul>
  `,
      styleUrls: ['./hero-list-page.component.css'],
      // #docregion animationdef
      animations: [
        trigger('flyInOut', [
          state('in', style({transform: 'translateX(0)'})),
          transition('void => *', [style({transform: 'translateX(-100%)'}), animate(100)]),
          transition('* => void', [animate(100, style({transform: 'translateX(100%)'}))]),
        ]),
      ],
      // #enddocregion animationdef
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var HeroListEnterLeaveComponent = class {
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
      HeroListEnterLeaveComponent = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    heroes = input([]);
    remove = output();
    removeHero(id) {
      this.remove.emit(id);
    }
  };
  return (HeroListEnterLeaveComponent = _classThis);
})();
export {HeroListEnterLeaveComponent};
//# sourceMappingURL=hero-list-enter-leave.component.js.map
