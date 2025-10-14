import {__esDecorate, __runInitializers} from 'tslib';
import {Component, signal} from '@angular/core';
// #docregion component
let BannerComponent = (() => {
  let _classDecorators = [
    Component({
      selector: 'app-banner',
      template: '<h1>{{title()}}</h1>',
      styles: ['h1 { color: green; font-size: 350%}'],
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var BannerComponent = class {
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
      BannerComponent = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    title = signal('Test Tour of Heroes');
  };
  return (BannerComponent = _classThis);
})();
export {BannerComponent};
// #enddocregion component
//# sourceMappingURL=banner.component.js.map
