import {Component, inject, ChangeDetectionStrategy} from '@angular/core';
import {CartStore} from './cart-store';

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
})
export class CartDisplay {
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

  increaseQuantity(id: string) {
    // TODO: Get current item from cartStore.cartItems()
    // and call cartStore.updateQuantity() with quantity + 1
  }

  decreaseQuantity(id: string) {
    // TODO: Get current item from cartStore.cartItems()
    // and call cartStore.updateQuantity() with quantity - 1 (if > 1)
  }

  removeItem(id: string) {
    this.cartStore.removeItem(id);
  }

  clearCart() {
    this.cartStore.clearCart();
  }
}
