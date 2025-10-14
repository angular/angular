import {__esDecorate, __runInitializers} from 'tslib';
// #docplaster
import {Component} from '@angular/core';
import {trigger, transition, animate, style} from '@angular/animations';
let InsertRemoveComponent = (() => {
  let _classDecorators = [
    Component({
      selector: 'app-insert-remove',
      animations: [
        // #docregion enter-leave-trigger
        trigger('myInsertRemoveTrigger', [
          transition(':enter', [style({opacity: 0}), animate('100ms', style({opacity: 1}))]),
          transition(':leave', [animate('100ms', style({opacity: 0}))]),
        ]),
        // #enddocregion enter-leave-trigger
      ],
      templateUrl: 'insert-remove.component.html',
      styleUrls: ['insert-remove.component.css'],
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var InsertRemoveComponent = class {
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
      InsertRemoveComponent = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    isShown = false;
    toggle() {
      this.isShown = !this.isShown;
    }
  };
  return (InsertRemoveComponent = _classThis);
})();
export {InsertRemoveComponent};
//# sourceMappingURL=insert-remove.component.js.map
