import {__esDecorate, __runInitializers} from 'tslib';
import {Component, output, input} from '@angular/core';
import {trigger, state, style, animate, transition, group} from '@angular/animations';
let HeroListGroupsComponent = (() => {
  let _classDecorators = [
    Component({
      selector: 'app-hero-list-groups',
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
          state(
            'in',
            style({
              width: '*',
              transform: 'translateX(0)',
              opacity: 1,
            }),
          ),
          transition(':enter', [
            style({width: 10, transform: 'translateX(50px)', opacity: 0}),
            group([
              animate(
                '0.3s 0.1s ease',
                style({
                  transform: 'translateX(0)',
                  width: '*',
                }),
              ),
              animate(
                '0.3s ease',
                style({
                  opacity: 1,
                }),
              ),
            ]),
          ]),
          transition(':leave', [
            group([
              animate(
                '0.3s ease',
                style({
                  transform: 'translateX(50px)',
                  width: 10,
                }),
              ),
              animate(
                '0.3s 0.2s ease',
                style({
                  opacity: 0,
                }),
              ),
            ]),
          ]),
        ]),
      ],
      // #enddocregion animationdef
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var HeroListGroupsComponent = class {
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
      HeroListGroupsComponent = _classThis = _classDescriptor.value;
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
  return (HeroListGroupsComponent = _classThis);
})();
export {HeroListGroupsComponent};
//# sourceMappingURL=hero-list-groups.component.js.map
