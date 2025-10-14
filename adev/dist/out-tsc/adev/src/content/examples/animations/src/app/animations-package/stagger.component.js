import {__esDecorate, __runInitializers} from 'tslib';
// #docplaster
// #docregion
import {Component, HostBinding} from '@angular/core';
import {trigger, transition, animate, style, query, stagger} from '@angular/animations';
let StaggerComponent = (() => {
  let _classDecorators = [
    Component({
      selector: 'app-stagger',
      templateUrl: 'stagger.component.html',
      styleUrls: ['stagger.component.css'],
      animations: [
        trigger('pageAnimations', [
          transition(':enter', [
            query('.item', [
              style({opacity: 0, transform: 'translateY(-10px)'}),
              stagger(200, [animate('500ms ease-in', style({opacity: 1, transform: 'none'}))]),
            ]),
          ]),
        ]),
      ],
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  let _items_decorators;
  let _items_initializers = [];
  let _items_extraInitializers = [];
  var StaggerComponent = class {
    static {
      _classThis = this;
    }
    static {
      const _metadata =
        typeof Symbol === 'function' && Symbol.metadata ? Object.create(null) : void 0;
      _items_decorators = [HostBinding('@pageAnimations')];
      __esDecorate(
        null,
        null,
        _items_decorators,
        {
          kind: 'field',
          name: 'items',
          static: false,
          private: false,
          access: {
            has: (obj) => 'items' in obj,
            get: (obj) => obj.items,
            set: (obj, value) => {
              obj.items = value;
            },
          },
          metadata: _metadata,
        },
        _items_initializers,
        _items_extraInitializers,
      );
      __esDecorate(
        null,
        (_classDescriptor = {value: _classThis}),
        _classDecorators,
        {kind: 'class', name: _classThis.name, metadata: _metadata},
        null,
        _classExtraInitializers,
      );
      StaggerComponent = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    items = __runInitializers(this, _items_initializers, [1, 2, 3]);
    constructor() {
      __runInitializers(this, _items_extraInitializers);
    }
  };
  return (StaggerComponent = _classThis);
})();
export {StaggerComponent};
//# sourceMappingURL=stagger.component.js.map
