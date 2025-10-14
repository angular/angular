import {__esDecorate, __runInitializers} from 'tslib';
import {Component} from '@angular/core';
let PageNotFoundComponent = (() => {
  let _classDecorators = [
    Component({
      selector: 'app-page-not-found',
      templateUrl: './page-not-found.component.html',
      styleUrls: ['./page-not-found.component.css'],
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var PageNotFoundComponent = class {
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
      PageNotFoundComponent = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
  };
  return (PageNotFoundComponent = _classThis);
})();
export {PageNotFoundComponent};
//# sourceMappingURL=page-not-found.component.js.map
