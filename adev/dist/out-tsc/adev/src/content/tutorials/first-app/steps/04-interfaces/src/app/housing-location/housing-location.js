import {__esDecorate, __runInitializers} from 'tslib';
import {Component} from '@angular/core';
let HousingLocation = (() => {
  let _classDecorators = [
    Component({
      selector: 'app-housing-location',
      template: `
    <p>housing-location works!</p>
  `,
      styleUrls: ['./housing-location.css'],
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var HousingLocation = class {
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
      HousingLocation = _classThis = _classDescriptor.value;
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
  return (HousingLocation = _classThis);
})();
export {HousingLocation};
//# sourceMappingURL=housing-location.js.map
