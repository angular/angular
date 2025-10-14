import {__esDecorate, __runInitializers} from 'tslib';
import {Component, input} from '@angular/core';
let ItemDetailComponent = (() => {
  let _classDecorators = [
    Component({
      selector: 'app-item-detail',
      templateUrl: './item-detail.component.html',
      styleUrls: ['./item-detail.component.css'],
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var ItemDetailComponent = class {
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
      ItemDetailComponent = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    item = input();
  };
  return (ItemDetailComponent = _classThis);
})();
export {ItemDetailComponent};
//# sourceMappingURL=item-detail.component.js.map
