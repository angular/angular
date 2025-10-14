import {__esDecorate, __runInitializers} from 'tslib';
// #docplaster
// #docregion
import {Component, signal} from '@angular/core';
import {trigger, transition, animate, style} from '@angular/animations';
let IncrementDecrementComponent = (() => {
  let _classDecorators = [
    Component({
      selector: 'app-increment-decrement',
      templateUrl: 'increment-decrement.component.html',
      styleUrls: ['increment-decrement.component.css'],
      animations: [
        trigger('incrementAnimation', [
          transition(':increment', [
            animate('300ms ease-out', style({color: 'green', transform: 'scale(1.3, 1.2)'})),
          ]),
          transition(':decrement', [
            animate('300ms ease-out', style({color: 'red', transform: 'scale(0.8, 0.9)'})),
          ]),
        ]),
      ],
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var IncrementDecrementComponent = class {
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
      IncrementDecrementComponent = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    num = signal(0);
    modify(n) {
      this.num.update((v) => (v += n));
    }
  };
  return (IncrementDecrementComponent = _classThis);
})();
export {IncrementDecrementComponent};
//# sourceMappingURL=increment-decrement.component.js.map
