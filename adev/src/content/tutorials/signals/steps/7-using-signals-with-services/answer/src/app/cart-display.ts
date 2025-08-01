import {Component, inject, ChangeDetectionStrategy} from '@angular/core';
import {CartService} from './cart-service';
import {CartItem} from './cart-types';

@Component({
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
      @if (cartService.cartItems().length === 0) {
        <p class="empty-message">Your cart is empty</p>
      } @else {
        <div class="cart-items">
          @for (item of cartService.cartItems(); track item.id) {
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
          <p>Total Items: {{ cartService.totalQuantity() }}</p>
          <p class="total-price">Total: \${{ cartService.totalPrice() }}</p>
          <button (click)="clearCart()" class="clear-btn">Clear Cart</button>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CartDisplay {
  cartService = inject(CartService);

  addLaptop() {
    this.cartService.addItem('1', 'Laptop', 999);
  }

  addMouse() {
    this.cartService.addItem('2', 'Mouse', 25);
  }

  addKeyboard() {
    this.cartService.addItem('3', 'Keyboard', 79);
  }

  increaseQuantity(id: string) {
    const items = this.cartService.cartItems();
    const currentItem: CartItem | undefined = items.find((item: CartItem) => item.id === id);
    if (currentItem) {
      this.cartService.updateQuantity(id, currentItem.quantity + 1);
    }
  }

  decreaseQuantity(id: string) {
    const items = this.cartService.cartItems();
    const currentItem = items.find((item: CartItem) => item.id === id);
    if (currentItem && currentItem.quantity > 1) {
      this.cartService.updateQuantity(id, currentItem.quantity - 1);
    }
  }

  removeItem(id: string) {
    this.cartService.removeItem(id);
  }

  clearCart() {
    this.cartService.clearCart();
  }
}
