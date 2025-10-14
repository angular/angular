import {__esDecorate, __runInitializers} from 'tslib';
import {Component} from '@angular/core';
import {User} from './user';
let App = (() => {
  let _classDecorators = [
    Component({
      selector: 'app-root',
      template: `
    <app-user name="Simran" />
  `,
      imports: [User],
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var App = class {
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
      App = _classThis = _classDescriptor.value;
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
  return (App = _classThis);
})();
export {App};
//# sourceMappingURL=app.js.map
