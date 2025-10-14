import {__esDecorate, __runInitializers} from 'tslib';
import {Component, inject, ChangeDetectionStrategy} from '@angular/core';
import {CartStore} from './cart-store';
let CartDisplay = (() => {
  let _classDecorators = [
    Component({
      selector: 'cart-display',
      template: `
    <div class="cart-display">
      <h2>Shopping Cart Demo</h2>

      <!-- Add some products to test the cart -->
      <div class="add-products">
        <h3>Add Products</h3>
        <button (click)="addLaptop()">Add Laptop ($999)</button>
        <button (click)="addMouse()">Add Mouse ($25)</button>
        <button (click)="addKeyboard()">Add Keyboard ($79)</button>
      </div>

      <h3>Cart Contents</h3>
      @if (cartStore.cartItems().length === 0) {
        <p class="empty-message">Your cart is empty</p>
      } @else {
        <div class="cart-items">
          @for (item of cartStore.cartItems(); track item.id) {
            <div class="cart-item">
              <div class="item-info">
                <h4>{{ item.name }}</h4>
                <p class="price">\${{ item.price }} each</p>
              </div>

              <div class="quantity-controls">
                <button (click)="decreaseQuantity(item.id)">-</button>
                <span class="quantity">{{ item.quantity }}</span>
                <button (click)="increaseQuantity(item.id)">+</button>
                <button (click)="removeItem(item.id)" class="remove">×</button>
              </div>
            </div>
          }
        </div>

        <div class="cart-summary">
          <p>Total Items: {{ cartStore.totalQuantity() }}</p>
          <p class="total-price">Total: \${{ cartStore.totalPrice() }}</p>
          <button (click)="clearCart()" class="clear-btn">Clear Cart</button>
        </div>
      }
    </div>
  `,
      changeDetection: ChangeDetectionStrategy.OnPush,
    }),
  ];
  let _classDescriptor;
  let _classExtraInitializers = [];
  let _classThis;
  var CartDisplay = class {
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
      CartDisplay = _classThis = _classDescriptor.value;
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
    addLaptop() {
      this.cartStore.addItem('1', 'Laptop', 999);
    }
    addMouse() {
      this.cartStore.addItem('2', 'Mouse', 25);
    }
    addKeyboard() {
      this.cartStore.addItem('3', 'Keyboard', 79);
    }
    increaseQuantity(id) {
      const items = this.cartStore.cartItems();
      const currentItem = items.find((item) => item.id === id);
      if (currentItem) {
        this.cartStore.updateQuantity(id, currentItem.quantity + 1);
      }
    }
    decreaseQuantity(id) {
      const items = this.cartStore.cartItems();
      const currentItem = items.find((item) => item.id === id);
      if (currentItem && currentItem.quantity > 1) {
        this.cartStore.updateQuantity(id, currentItem.quantity - 1);
      }
    }
    removeItem(id) {
      this.cartStore.removeItem(id);
    }
    clearCart() {
      this.cartStore.clearCart();
    }
  };
  return (CartDisplay = _classThis);
})();
export {CartDisplay};
//# sourceMappingURL=cart-display.js.map
