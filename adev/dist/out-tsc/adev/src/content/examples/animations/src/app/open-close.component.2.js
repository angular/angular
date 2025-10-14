import {__esDecorate, __runInitializers} from 'tslib';
import {Component} from '@angular/core';
import {trigger, transition, state, animate, style} from '@angular/animations';
let OpenCloseBooleanComponent = (() => {
  let _classDecorators = [
    Component({
      selector: 'app-open-close-boolean',
      // #docregion trigger-boolean
      animations: [
        trigger('openClose', [
          state('true', style({height: '*'})),
          state('false', style({height: '0px'})),
          transition('false <=> true', animate(500)),
        ]),
      ],
      // #enddocregion trigger-boolean
      templateUrl: 'open-close.component.2.html',
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
  };
  return (OpenCloseBooleanComponent = _classThis);
})();
export {OpenCloseBooleanComponent};
//# sourceMappingURL=open-close.component.2.js.map
