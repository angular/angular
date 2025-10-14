import {__esDecorate, __runInitializers} from 'tslib';
// For documenting NgModule Apps only
// #docregion
import {LOCALE_ID, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {AppComponent} from '../src/app/app.component';
let AppModule = (() => {
  let _classDecorators = [
    NgModule({
      imports: [BrowserModule],
      declarations: [AppComponent],
      providers: [{provide: LOCALE_ID, useValue: 'fr'}],
      bootstrap: [AppComponent],
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var AppModule = class {
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
      AppModule = _classThis = _classDescriptor.value;
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
  return (AppModule = _classThis);
})();
export {AppModule};
//# sourceMappingURL=app.module.js.map
