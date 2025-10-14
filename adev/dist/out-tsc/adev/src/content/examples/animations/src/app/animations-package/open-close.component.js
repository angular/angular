import {__esDecorate, __runInitializers} from 'tslib';
import {Component, signal} from '@angular/core';
import {trigger, transition, state, animate, style, keyframes} from '@angular/animations';
let OpenCloseComponent = (() => {
  let _classDecorators = [
    Component({
      selector: 'app-open-close',
      animations: [
        trigger('openClose', [
          state(
            'open',
            style({
              height: '200px',
              opacity: 1,
              backgroundColor: 'yellow',
            }),
          ),
          state(
            'closed',
            style({
              height: '100px',
              opacity: 0.5,
              backgroundColor: 'green',
            }),
          ),
          // ...
          transition('* => *', [
            animate(
              '1s',
              keyframes([
                style({opacity: 0.1, offset: 0.1}),
                style({opacity: 0.6, offset: 0.2}),
                style({opacity: 1, offset: 0.5}),
                style({opacity: 0.2, offset: 0.7}),
              ]),
            ),
          ]),
        ]),
      ],
      templateUrl: 'open-close.component.html',
      styleUrl: 'open-close.component.css',
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var OpenCloseComponent = class {
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
      OpenCloseComponent = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    isOpen = signal(false);
    toggle() {
      this.isOpen.update((isOpen) => !isOpen);
    }
  };
  return (OpenCloseComponent = _classThis);
})();
export {OpenCloseComponent};
//# sourceMappingURL=open-close.component.js.map
