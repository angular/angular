import {__esDecorate, __runInitializers} from 'tslib';
import {Component, input, ChangeDetectionStrategy} from '@angular/core';
let ProductCard = (() => {
  let _classDecorators = [
    Component({
      selector: 'product-card',
      template: `
    <div class="product-card">
      <h3>{{ name() }}</h3>
      <p class="price">\${{ price() }}</p>
      <p class="status">
        Status: 
        @if (available()) {
          <span class="available">Available</span>
        } @else {
          <span class="unavailable">Out of Stock</span>
        }
      </p>
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
    // Signal inputs - receive data from parent
    name = input.required();
    price = input.required();
    available = input(true);
  };
  return (ProductCard = _classThis);
})();
export {ProductCard};
//# sourceMappingURL=product-card.js.map
