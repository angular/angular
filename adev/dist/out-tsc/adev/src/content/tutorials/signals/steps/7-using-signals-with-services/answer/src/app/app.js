import {__esDecorate, __runInitializers} from 'tslib';
import {Component, inject, ChangeDetectionStrategy} from '@angular/core';
import {CartStore} from './cart-store';
import {CartDisplay} from './cart-display';
let App = (() => {
  let _classDecorators = [
    Component({
      selector: 'app-root',
      imports: [CartDisplay],
      template: `
    <div class="shopping-app">
      <header>
        <h1>Signals with Services Demo</h1>
        <div class="cart-badge">
          Cart: {{ cartStore.totalQuantity() }} items (\${{ cartStore.totalPrice() }})
        </div>
      </header>
      
      <main>
        <cart-display></cart-display>
      </main>
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
    cartStore = inject(CartStore);
  };
  return (App = _classThis);
})();
export {App};
//# sourceMappingURL=app.js.map
