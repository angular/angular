import {__esDecorate, __runInitializers} from 'tslib';
import {Component} from '@angular/core';
let CrisisListComponent = (() => {
  let _classDecorators = [
    Component({
      selector: 'app-crisis-list',
      templateUrl: './crisis-list.component.html',
      styleUrls: ['./crisis-list.component.css'],
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var CrisisListComponent = class {
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
      CrisisListComponent = _classThis = _classDescriptor.value;
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
  return (CrisisListComponent = _classThis);
})();
export {CrisisListComponent};
//# sourceMappingURL=crisis-list.component.js.map
