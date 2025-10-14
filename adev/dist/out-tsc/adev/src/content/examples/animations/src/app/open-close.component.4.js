import {__esDecorate, __runInitializers} from 'tslib';
// #docplaster
// #docregion
import {Component} from '@angular/core';
import {trigger, transition, state, animate, style} from '@angular/animations';
// #docregion toggle-animation
let OpenCloseChildComponent = (() => {
  let _classDecorators = [
    Component({
      // #enddocregion toggle-animation
      selector: 'app-open-close-toggle',
      templateUrl: 'open-close.component.4.html',
      styleUrls: ['open-close.component.css'],
      // #docregion toggle-animation
      animations: [
        trigger('childAnimation', [
          // ...
          // #enddocregion toggle-animation
          state(
            'open',
            style({
              width: '250px',
              opacity: 1,
              backgroundColor: 'yellow',
            }),
          ),
          state(
            'closed',
            style({
              width: '100px',
              opacity: 0.8,
              backgroundColor: 'blue',
            }),
          ),
          transition('* => *', [animate('1s')]),
          // #docregion toggle-animation
        ]),
      ],
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var OpenCloseChildComponent = class {
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
      OpenCloseChildComponent = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    isDisabled = false;
    isOpen = false;
    // #enddocregion toggle-animation
    toggleAnimations() {
      this.isDisabled = !this.isDisabled;
    }
    toggle() {
      this.isOpen = !this.isOpen;
    }
  };
  return (OpenCloseChildComponent = _classThis);
})();
export {OpenCloseChildComponent};
// #enddocregion toggle-animation
//# sourceMappingURL=open-close.component.4.js.map
