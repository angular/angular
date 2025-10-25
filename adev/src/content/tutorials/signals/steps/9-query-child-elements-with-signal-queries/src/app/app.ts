// TODO: Import viewChild from @angular/core
import {Component, signal, computed, ChangeDetectionStrategy} from '@angular/core';
import {CartSummary} from './cart-summary';
import {ProductCard} from './product-card';

@Component({
  selector: 'app-root',
  imports: [ProductCard, CartSummary],
  template: `
    <div class="shopping-app">
      <h1>Advanced Shopping Cart</h1>

      <div class="controls">
        <button (click)="showFirstProductDetails()">Show First Product Details</button>
        <button (click)="initiateCheckout()">Initiate Checkout</button>
      </div>

      <div class="products">
        <product-card
          [name]="'Laptop'"
          [price]="999"
          [description]="'High-performance laptop'"
          [available]="true"
          [productId]="'LAP001'"
          [category]="'Electronics'">
        </product-card>
      </div>

      <div class="cart-section">
        <cart-summary
          [itemCount]="cartQuantity()"
          [total]="totalPrice()">
        </cart-summary>

        <div class="cart-controls">
          <label>Quantity:</label>
          <button (click)="updateQuantity(-1)" [disabled]="cartQuantity() <= 0">-</button>
          <span class="quantity">{{ cartQuantity() }}</span>
          <button (click)="updateQuantity(1)" [disabled]="cartQuantity() >= 10">+</button>
        </div>
      </div>
    </div>
  `,
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  cartQuantity = signal(2);

  // TODO: Create viewChild queries to access child components
  // firstProduct = viewChild(ProductCard);
  // cartSummary = viewChild(CartSummary);

  totalPrice = computed(() => {
    return this.cartQuantity() * 999;
  });

  updateQuantity(change: number) {
    const newQuantity = this.cartQuantity() + change;
    if (newQuantity >= 0 && newQuantity <= 10) {
      this.cartQuantity.set(newQuantity);
    }
  }

  showFirstProductDetails() {
    // TODO: Get the first product using viewChild and call its highlight() method
    console.log('TODO: Implement show first product details');
  }

  initiateCheckout() {
    // TODO: Get the cart summary using viewChild and call its initiateCheckout() method
    console.log('TODO: Implement initiate checkout');
  }
}
