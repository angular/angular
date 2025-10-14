import {__esDecorate, __runInitializers} from 'tslib';
// #docplaster
// #docregion
import {Component, HostBinding} from '@angular/core';
import {trigger, transition, animate, style, query, stagger} from '@angular/animations';
import {HEROES} from './mock-heroes';
// #docregion filter-animations
let HeroListPageComponent = (() => {
  let _classDecorators = [
    Component({
      // #enddocregion filter-animations
      selector: 'app-hero-list-page',
      templateUrl: 'hero-list-page.component.html',
      styleUrls: ['hero-list-page.component.css'],
      // #docregion page-animations, filter-animations
      animations: [
        // #enddocregion filter-animations
        trigger('pageAnimations', [
          transition(':enter', [
            query('.hero', [
              style({opacity: 0, transform: 'translateY(-100px)'}),
              stagger(30, [
                animate(
                  '500ms cubic-bezier(0.35, 0, 0.25, 1)',
                  style({opacity: 1, transform: 'none'}),
                ),
              ]),
            ]),
          ]),
        ]),
        // #enddocregion page-animations
        // #docregion increment
        // #docregion filter-animations
        trigger('filterAnimation', [
          transition(':enter, * => 0, * => -1', []),
          transition(':increment', [
            query(
              ':enter',
              [
                style({opacity: 0, width: 0}),
                stagger(50, [animate('300ms ease-out', style({opacity: 1, width: '*'}))]),
              ],
              {optional: true},
            ),
          ]),
          transition(':decrement', [
            query(':leave', [
              stagger(50, [animate('300ms ease-out', style({opacity: 0, width: 0}))]),
            ]),
          ]),
        ]),
        // #enddocregion  increment
      ],
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  let _animatePage_decorators;
  let _animatePage_initializers = [];
  let _animatePage_extraInitializers = [];
  var HeroListPageComponent = class {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata ? Object.create(null) : void 0;
      _animatePage_decorators = [HostBinding('@pageAnimations')];
      __esDecorate(
        null,
        null,
        _animatePage_decorators,
        {
          kind: 'field',
          name: 'animatePage',
          static: false,
          private: false,
          access: {
            has: (obj) => 'animatePage' in obj,
            get: (obj) => obj.animatePage,
            set: (obj, value) => {
              obj.animatePage = value;
            },
          },
          metadata: _metadata,
        },
        _animatePage_initializers,
        _animatePage_extraInitializers,
      );
      __esDecorate(
        null,
        (_classDescriptor = {value: _classThis}),
        _classDecorators,
        {kind: 'class', name: _classThis.name, metadata: _metadata},
        null,
        _classExtraInitializers,
      );
      HeroListPageComponent = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    // #enddocregion filter-animations
    animatePage = __runInitializers(this, _animatePage_initializers, true);
    // #docregion filter-animations
    heroesTotal = (__runInitializers(this, _animatePage_extraInitializers), -1);
    get heroes() {
      return this._heroes;
    }
    _heroes = [];
    ngOnInit() {
      this._heroes = HEROES;
    }
    updateCriteria(criteria) {
      criteria = criteria ? criteria.trim() : '';
      this._heroes = HEROES.filter((hero) =>
        hero.name.toLowerCase().includes(criteria.toLowerCase()),
      );
      const newTotal = this.heroes.length;
      if (this.heroesTotal !== newTotal) {
        this.heroesTotal = newTotal;
      } else if (!criteria) {
        this.heroesTotal = -1;
      }
    }
  };
  return (HeroListPageComponent = _classThis);
})();
export {HeroListPageComponent};
// #enddocregion filter-animations
//# sourceMappingURL=hero-list-page.component.js.map
