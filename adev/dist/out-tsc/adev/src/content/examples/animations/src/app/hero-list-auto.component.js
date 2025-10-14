import {__esDecorate, __runInitializers} from 'tslib';
import {Component, Output, EventEmitter, input} from '@angular/core';
import {trigger, state, style, animate, transition} from '@angular/animations';
let HeroListAutoComponent = (() => {
  let _classDecorators = [
    Component({
      selector: 'app-hero-list-auto',
      templateUrl: 'hero-list-auto.component.html',
      styleUrls: ['./hero-list-page.component.css'],
      // #docregion auto-calc
      animations: [
        trigger('shrinkOut', [
          state('in', style({height: '*'})),
          transition('* => void', [style({height: '*'}), animate(250, style({height: 0}))]),
        ]),
      ],
      // #enddocregion auto-calc
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  let _remove_decorators;
  let _remove_initializers = [];
  let _remove_extraInitializers = [];
  var HeroListAutoComponent = class {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata ? Object.create(null) : void 0;
      _remove_decorators = [Output()];
      __esDecorate(
        null,
        null,
        _remove_decorators,
        {
          kind: 'field',
          name: 'remove',
          static: false,
          private: false,
          access: {
            has: (obj) => 'remove' in obj,
            get: (obj) => obj.remove,
            set: (obj, value) => {
              obj.remove = value;
            },
          },
          metadata: _metadata,
        },
        _remove_initializers,
        _remove_extraInitializers,
      );
      __esDecorate(
        null,
        (_classDescriptor = {value: _classThis}),
        _classDecorators,
        {kind: 'class', name: _classThis.name, metadata: _metadata},
        null,
        _classExtraInitializers,
      );
      HeroListAutoComponent = _classThis = _classDescriptor.value;
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
    remove = __runInitializers(this, _remove_initializers, new EventEmitter());
    removeHero(id) {
      this.remove.emit(id);
    }
    constructor() {
      __runInitializers(this, _remove_extraInitializers);
    }
  };
  return (HeroListAutoComponent = _classThis);
})();
export {HeroListAutoComponent};
//# sourceMappingURL=hero-list-auto.component.js.map
