import {Component, signal, computed, viewChild, ChangeDetectionStrategy} from '@angular/core';
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

  // Query APIs to access child components
  firstProduct = viewChild(ProductCard);
  allProducts = viewChild.required(ProductCard, {read: ProductCard});
  cartSummary = viewChild(CartSummary);

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
    const product = this.firstProduct();
    if (product) {
      product.highlight();
    }
  }

  initiateCheckout() {
    const summary = this.cartSummary();
    if (summary) {
      summary.initiateCheckout();
    }
  }
}
