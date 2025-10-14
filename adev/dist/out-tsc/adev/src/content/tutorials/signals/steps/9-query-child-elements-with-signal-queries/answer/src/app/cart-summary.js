import {__esDecorate, __runInitializers} from 'tslib';
import {Component, input, signal, ChangeDetectionStrategy} from '@angular/core';
let CartSummary = (() => {
  let _classDecorators = [
    Component({
      selector: 'cart-summary',
      template: `
    <div class="cart-summary" [style.background]="isAnimating() ? '#e8f5e8' : ''">
      <h3>Cart Summary {{ isAnimating() ? '🎉' : '' }}</h3>
      <p>Items: {{ itemCount() }}</p>
      <p>Total: \${{ total() }}</p>
      @if (isAnimating()) {
        <p style="color: green; font-weight: bold;">Processing checkout...</p>
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
  var CartSummary = class {
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
      CartSummary = _classThis = _classDescriptor.value;
      if (_metadata)
        Object.defineProperty(_classThis, Symbol.metadata, {
          enumerable: true,
          configurable: true,
          writable: true,
          value: _metadata,
        });
      __runInitializers(_classThis, _classExtraInitializers);
    }
    itemCount = input.required();
    total = input.required();
    isAnimating = signal(false);
    timeoutId;
    // Public method for parent interaction
    initiateCheckout() {
      this.isAnimating.set(true);
      this.timeoutId = setTimeout(() => this.isAnimating.set(false), 2000);
    }
    ngOnDestroy() {
      if (this.timeoutId) {
        clearTimeout(this.timeoutId);
      }
    }
  };
  return (CartSummary = _classThis);
})();
export {CartSummary};
//# sourceMappingURL=cart-summary.js.map
