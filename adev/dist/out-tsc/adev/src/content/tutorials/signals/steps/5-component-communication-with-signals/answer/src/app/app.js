import {__esDecorate, __runInitializers} from 'tslib';
import {Component, signal, ChangeDetectionStrategy} from '@angular/core';
import {ProductCard} from './product-card';
let App = (() => {
  let _classDecorators = [
    Component({
      selector: 'app-root',
      imports: [ProductCard],
      template: `
    <div class="shopping-app">
      <h1>Input Signals Demo</h1>

      <div class="demo-section">
        <h2>Signal Inputs (Parent → Child)</h2>
        <p>Data flows down from parent to child via signal inputs:</p>

        <product-card
          [name]="productName()"
          [price]="productPrice()"
          [available]="productAvailable()"
        />

        <div class="controls">
          <button (click)="updateProduct()">Update Product Data</button>
          <button (click)="toggleAvailability()">Toggle Availability</button>
        </div>
      </div>
    </div>
  `,
      styleUrl: './app.css',
      changeDetection: ChangeDetectionStrategy.OnPush,
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
    // Signal inputs data
    productName = signal('Demo Product');
    productPrice = signal(99);
    productAvailable = signal(true);
    updateProduct() {
      this.productName.set(`Product ${Math.floor(Math.random() * 100)}`);
      this.productPrice.set(Math.floor(Math.random() * 500) + 50);
    }
    toggleAvailability() {
      this.productAvailable.set(!this.productAvailable());
    }
  };
  return (App = _classThis);
})();
export {App};
//# sourceMappingURL=app.js.map
