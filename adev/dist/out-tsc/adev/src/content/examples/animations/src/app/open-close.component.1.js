import {__esDecorate, __runInitializers} from 'tslib';
import {Component, input} from '@angular/core';
import {trigger, transition, state, animate, style, keyframes} from '@angular/animations';
let OpenCloseKeyframeComponent = (() => {
  let _classDecorators = [
    Component({
      selector: 'app-open-close',
      animations: [
        // #docregion trigger
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
            'close',
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
        // #enddocregion trigger
      ],
      templateUrl: 'open-close.component.html',
      styleUrls: ['open-close.component.css'],
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var OpenCloseKeyframeComponent = class {
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
      OpenCloseKeyframeComponent = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    isOpen = false;
    toggle() {
      this.isOpen = !this.isOpen;
    }
    logging = input(false);
    onAnimationEvent(event) {
      if (!this.logging) {
        return;
      }
    }
  };
  return (OpenCloseKeyframeComponent = _classThis);
})();
export {OpenCloseKeyframeComponent};
//# sourceMappingURL=open-close.component.1.js.map
