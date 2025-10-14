import {__esDecorate, __runInitializers} from 'tslib';
import {Component} from '@angular/core';
let MyLibComponent = (() => {
  let _classDecorators = [
    Component({
      selector: 'lib-my-lib',
      template: `
    <p>
      my-lib works!
    </p>
  `,
      styles: [],
      standalone: false,
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var MyLibComponent = class {
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
      MyLibComponent = _classThis = _classDescriptor.value;
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
  return (MyLibComponent = _classThis);
})();
export {MyLibComponent};
//# sourceMappingURL=my-lib.component.js.map
