import {__esDecorate, __runInitializers} from 'tslib';
import {NgModule} from '@angular/core';
import {
  Provider1Component,
  Provider3Component,
  Provider4Component,
  Provider5Component,
  Provider6aComponent,
  Provider6bComponent,
  Provider7Component,
  Provider8Component,
  Provider9Component,
  Provider10Component,
  ProvidersComponent,
} from './providers.component';
let ProvidersModule = (() => {
  let _classDecorators = [
    NgModule({
      declarations: [
        Provider1Component,
        Provider3Component,
        Provider4Component,
        Provider5Component,
        Provider6aComponent,
        Provider6bComponent,
        Provider7Component,
        Provider8Component,
        Provider9Component,
        Provider10Component,
        ProvidersComponent,
      ],
      exports: [ProvidersComponent],
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var ProvidersModule = class {
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
      ProvidersModule = _classThis = _classDescriptor.value;
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
  return (ProvidersModule = _classThis);
})();
export {ProvidersModule};
//# sourceMappingURL=providers.module.js.map
