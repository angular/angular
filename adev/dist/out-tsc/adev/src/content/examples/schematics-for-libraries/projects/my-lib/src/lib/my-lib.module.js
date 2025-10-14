import {__esDecorate, __runInitializers} from 'tslib';
import {NgModule} from '@angular/core';
import {MyLibComponent} from './my-lib.component';
let MyLibModule = (() => {
  let _classDecorators = [
    NgModule({
      declarations: [MyLibComponent],
      imports: [],
      exports: [MyLibComponent],
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var MyLibModule = class {
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
      MyLibModule = _classThis = _classDescriptor.value;
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
  return (MyLibModule = _classThis);
})();
export {MyLibModule};
//# sourceMappingURL=my-lib.module.js.map
