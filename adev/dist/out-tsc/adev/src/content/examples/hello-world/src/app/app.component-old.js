import {__esDecorate, __runInitializers} from 'tslib';
import {Component} from '@angular/core';
let HelloWorldComponent = (() => {
  let _classDecorators = [
    Component({
      selector: 'hello-world',
      templateUrl: 'app.component.html',
      styleUrl: 'app.component.css',
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var HelloWorldComponent = class {
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
      HelloWorldComponent = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    message = 'Hello World!';
  };
  return (HelloWorldComponent = _classThis);
})();
export {HelloWorldComponent};
//# sourceMappingURL=app.component-old.js.map
