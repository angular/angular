import {__esDecorate, __runInitializers} from 'tslib';
// #docplaster
import {Component, signal} from '@angular/core';
let LeaveEvent = (() => {
  let _classDecorators = [
    Component({
      selector: 'app-leave-binding',
      templateUrl: 'leave-event.html',
      styleUrls: ['leave-event.css'],
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var LeaveEvent = class {
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
      LeaveEvent = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    isShown = signal(false);
    toggle() {
      this.isShown.update((isShown) => !isShown);
    }
    leavingFn(event) {
      // Example of calling GSAP
      // gsap.to(event.target, {
      //   duration: 1,
      //   x: 100,
      //   // arrow functions are handy for concise callbacks
      //   onComplete: () => event.animationComplete()
      // });
      event.animationComplete();
    }
  };
  return (LeaveEvent = _classThis);
})();
export {LeaveEvent};
//# sourceMappingURL=leave-event.js.map
