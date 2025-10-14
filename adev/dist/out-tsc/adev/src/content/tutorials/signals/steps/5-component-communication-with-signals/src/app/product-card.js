import {__esDecorate, __runInitializers} from 'tslib';
import {Component, ChangeDetectionStrategy} from '@angular/core';
// TODO: Import input from @angular/core
let ProductCard = (() => {
  let _classDecorators = [
    Component({
      selector: 'product-card',
      template: `
    <div class="product-card">
      <!-- TODO: Display signal input values -->
      <h3>Product Name</h3>
      <p class="price">$0</p>
      <p class="status">Status: Available</p>
    </div>
  `,
      changeDetection: ChangeDetectionStrategy.OnPush,
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var ProductCard = class {
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
      ProductCard = _classThis = _classDescriptor.value;
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
  return (ProductCard = _classThis);
})();
export {ProductCard};
//# sourceMappingURL=product-card.js.map
