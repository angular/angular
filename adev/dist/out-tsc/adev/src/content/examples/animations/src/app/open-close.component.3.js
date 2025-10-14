import {__esDecorate, __runInitializers} from 'tslib';
// #docplaster
// #docregion reusable
import {Component, input} from '@angular/core';
import {transition, trigger, useAnimation} from '@angular/animations';
import {transitionAnimation} from './animations';
let OpenCloseBooleanComponent = (() => {
  let _classDecorators = [
    Component({
      selector: 'app-open-close-reusable',
      animations: [
        trigger('openClose', [
          transition('open => closed', [
            useAnimation(transitionAnimation, {
              params: {
                height: 0,
                opacity: 1,
                backgroundColor: 'red',
                time: '1s',
              },
            }),
          ]),
        ]),
      ],
      templateUrl: 'open-close.component.html',
      styleUrls: ['open-close.component.css'],
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var OpenCloseBooleanComponent = class {
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
      OpenCloseBooleanComponent = _classThis = _classDescriptor.value;
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
  return (OpenCloseBooleanComponent = _classThis);
})();
export {OpenCloseBooleanComponent};
//# sourceMappingURL=open-close.component.3.js.map
