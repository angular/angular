import {__esDecorate, __runInitializers} from 'tslib';
import {Component, signal} from '@angular/core';
import {trigger, transition, state, animate, style} from '@angular/animations';
let AutoHeightComponent = (() => {
  let _classDecorators = [
    Component({
      selector: 'app-open-close',
      animations: [
        trigger('openClose', [
          state('true', style({height: '*'})),
          state('false', style({height: '0px'})),
          transition('false <=> true', animate(1000)),
        ]),
      ],
      templateUrl: 'auto-height.component.html',
      styleUrl: 'auto-height.component.css',
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var AutoHeightComponent = class {
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
      AutoHeightComponent = _classThis = _classDescriptor.value;
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
  return (AutoHeightComponent = _classThis);
})();
export {AutoHeightComponent};
//# sourceMappingURL=auto-height.component.js.map
