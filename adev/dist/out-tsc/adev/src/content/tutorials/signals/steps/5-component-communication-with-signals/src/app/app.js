import {__esDecorate, __runInitializers} from 'tslib';
// TODO: Import signal from @angular/core
import {Component, ChangeDetectionStrategy} from '@angular/core';
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

        <!-- TODO: Change from static values to dynamic signal values -->
        <product-card
          name="Static Product"
          price="99"
          available="true"
        />

        <!-- TODO: Add controls to test reactive updates -->
        <div class="controls">
          <!-- Add buttons to update product data and toggle availability -->
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
  };
  return (App = _classThis);
})();
export {App};
//# sourceMappingURL=app.js.map
