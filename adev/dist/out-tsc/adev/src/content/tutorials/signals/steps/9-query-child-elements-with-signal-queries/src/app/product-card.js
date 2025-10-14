import {__esDecorate, __runInitializers} from 'tslib';
import {Component, input, signal, ChangeDetectionStrategy} from '@angular/core';
let ProductCard = (() => {
  let _classDecorators = [
    Component({
      selector: 'product-card',
      template: `
    <div class="product-card" #cardElement>
      <h3 #productTitle>{{ name() }}</h3>
      <p class="price">\${{ price() }}</p>
      <p class="description">{{ description() }}</p>
      <div class="actions">
        <button (click)="toggleDetails()">
          @if (showDetails()) {
            Hide
          } @else {
            Show
          } Details
        </button>
      </div>
      @if (showDetails()) {
        <div class="details">
          <p>Product ID: {{ productId() }}</p>
          <p>Category: {{ category() }}</p>
        </div>
      }
    </div>
  `,
      styleUrl: './app.css',
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
    name = input.required();
    price = input.required();
    description = input('');
    available = input(true);
    productId = input('');
    category = input('');
    showDetails = signal(false);
    toggleDetails() {
      this.showDetails.set(!this.showDetails());
    }
    // Public methods for parent interaction
    highlight() {
      this.showDetails.set(true);
    }
  };
  return (ProductCard = _classThis);
})();
export {ProductCard};
//# sourceMappingURL=product-card.js.map
