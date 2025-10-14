import {__esDecorate, __runInitializers} from 'tslib';
import {Component} from '@angular/core';
// #docregion self-no-data-component
let SelfNoDataComponent = (() => {
  let _classDecorators = [
    Component({
      selector: 'app-self-no-data',
      templateUrl: './self-no-data.component.html',
      styleUrls: ['./self-no-data.component.css'],
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var SelfNoDataComponent = class {
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
      SelfNoDataComponent = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    leaf;
    constructor(leaf) {
      this.leaf = leaf;
    }
  };
  return (SelfNoDataComponent = _classThis);
})();
export {SelfNoDataComponent};
// #enddocregion self-no-data-component
// The app doesn't break because the value being available at self is optional.
// If you remove @Optional(), the app breaks.
//# sourceMappingURL=self-no-data.component.js.map
